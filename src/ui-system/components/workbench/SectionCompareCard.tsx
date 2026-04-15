import {
  BookMarkedIcon,
  ChevronDown,
  Clock,
  MapPinIcon,
} from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { ModifiedSection } from "../../../course-management/types/Section";

import {
  emptyGradeData,
  gradeDistributionPercents,
  GradeDistributionPercentList,
  GradeDistributionPieChart,
  RmpStarsWithScore,
  seatTallyHeatBackground,
} from "./PlannerSectionInsights";
import { formatSectionInstructors, gradeDistributionTotal } from "./sectionCompareUtils";

/** Nested controls use stopPropagation; role="group" is for structure only. */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

const CARD_GRADE_PIE_SIZE = 80;
const CARD_GRADE_PIE_SIZE_EMPTY = 64;

function SectionGradeDistributionBlock({ section }: { section: ModifiedSection }) {
  const g = section.grade_distribution;
  const total = gradeDistributionTotal(g);
  const chartData = g ?? emptyGradeData;
  const hasSample = Boolean(g) && total > 0;
  const min = g?.class_avg_min;
  const max = g?.class_avg_max;
  const hasGpaBand =
    g != null &&
    Number.isFinite(min) &&
    Number.isFinite(max) &&
    (max as number) >= (min as number);

  const detailRows = useMemo(() => {
    if (!hasSample || !g) {
      return [];
    }
    const all = gradeDistributionPercents(g);
    const filtered = all.filter((r) => r.pct >= 0.05);
    return filtered.length > 0 ? filtered : all;
  }, [g, hasSample]);

  return (
    <div
      role="group"
      aria-label="Grade distribution"
      className={cn(
        "flex max-w-[min(100%,15.5rem)] shrink-0 flex-col gap-1.5 rounded-xl border border-border/60 bg-muted/15 p-2 ring-1 ring-foreground/5 shadow-sm sm:max-w-[17.5rem] sm:p-2.5",
        !hasSample && "opacity-70",
      )}
      title={
        hasSample
          ? "Historical letter-grade mix and typical class GPA range when available"
          : "No grade distribution sample for this section"
      }
    >
      {!hasSample ? (
        <div className="flex flex-col items-center gap-1">
          <GradeDistributionPieChart
            data={chartData}
            size={CARD_GRADE_PIE_SIZE_EMPTY}
            className="text-muted-foreground/35"
          />
          <span className="text-center text-[10px] font-medium text-muted-foreground">
            No grades
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="shrink-0 rounded-lg border border-border/50 bg-background/40 p-1 sm:p-1.5">
            <GradeDistributionPieChart
              data={g!}
              size={CARD_GRADE_PIE_SIZE}
              className="drop-shadow-sm"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Letter mix
            </div>
            <GradeDistributionPercentList
              rows={detailRows}
              variant="compact"
              fractionDigits={1}
            />
            {hasGpaBand ? (
              <p className="pt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                Typical class GPA{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {(min as number).toFixed(2)}–{(max as number).toFixed(2)}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function sectionStatusBadgeVariant(
  availability: string | undefined,
): "default" | "secondary" | "destructive" | "outline" {
  if (!availability) {
    return "secondary";
  }
  const key = availability.trim().toLowerCase();
  if (key.startsWith("open")) {
    return "default";
  }
  if (key.startsWith("closed")) {
    return "destructive";
  }
  if (key.includes("wait")) {
    return "outline";
  }
  if (key.includes("reserved")) {
    return "secondary";
  }
  return "secondary";
}

function linkedMeetingsPanelTitle(linked: { component?: string }[]): string {
  if (linked.length === 0) {
    return "Linked sections";
  }
  const comps = new Set(
    linked.map((m) => (m.component ?? "").trim().toLowerCase()),
  );
  if (comps.size === 1 && comps.has("rec")) {
    return "Recitation sections";
  }
  if (comps.size === 1 && comps.has("lab")) {
    return "Lab sections";
  }
  return "Linked sections";
}

export type SectionCompareCardProps = {
  section: ModifiedSection;
  isSelected: boolean;
  onSelect: () => void;
  /** When several linked meetings: controlled active lab class # */
  selectedLabClassNumber?: string;
  onLabClassChange?: (classNbr: string) => void;
  /** Staging mock cart vs extension {@link ToCartGroupedSectionCell} */
  addToCartSlot: ReactNode;
};

export function SectionCompareCard({
  section,
  isSelected,
  onSelect,
  selectedLabClassNumber,
  onLabClassChange,
  addToCartSlot,
}: SectionCompareCardProps) {
  const linkedLabs = section.linkedMeetings ?? [];
  const multiLab = linkedLabs.length > 1;
  const linkedPanelTitle = useMemo(
    () => linkedMeetingsPanelTitle(linkedLabs),
    [linkedLabs],
  );
  const [labPanelOpen, setLabPanelOpen] = useState(() => multiLab);
  useEffect(() => {
    setLabPanelOpen(linkedLabs.length > 1);
  }, [section.id, linkedLabs.length]);
  const activeLabClass =
    multiLab && selectedLabClassNumber
      ? selectedLabClassNumber
      : multiLab
        ? String(linkedLabs[0]!.classNumber ?? "")
        : undefined;
  const activeLab = multiLab
    ? (linkedLabs.find(
        (m) => String(m.classNumber) === String(activeLabClass),
      ) ?? linkedLabs[0])
    : undefined;

  const courseCode = section.courseData?.code ?? section.course_id ?? "";
  const title = section.courseData?.title ?? "";
  const instructor = formatSectionInstructors(section);

  return (
    <div
      role="option"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-selected={isSelected}
      className={`cursor-pointer rounded-xl border-2 p-4 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isSelected
          ? "border-primary bg-primary/[0.12] shadow-sm ring-2 ring-primary/25 dark:border-primary/50 dark:bg-primary/12 dark:shadow-[inset_0_0_0_1px_rgba(79,140,255,0.25)] dark:ring-primary/35"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30 dark:bg-background/40 dark:hover:border-border dark:hover:bg-background/55"
      }`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-foreground">
              {courseCode}
            </span>
            <Badge
              variant={sectionStatusBadgeVariant(section.availability)}
              className="font-medium"
            >
              {section.availability || "—"}
            </Badge>
            <Badge
              className="border-0 font-semibold text-primary-foreground shadow-none"
              style={{
                backgroundColor: seatTallyHeatBackground(section.enrollment),
              }}
            >
              Seats {section.enrollment || "—"}
            </Badge>
          </div>
          {title ? (
            <p className="text-sm text-muted-foreground">{title}</p>
          ) : null}
        </div>
        <SectionGradeDistributionBlock section={section} />
      </div>

      <div className="mt-2 flex min-w-0 flex-col gap-1 text-sm">
        <span className="min-w-0 font-medium text-foreground">{instructor}</span>
        <RmpStarsWithScore
          avgRating={section.professor_rating?.avgRating ?? null}
          starClassName="size-3.5"
        />
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <BookMarkedIcon
            className="size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span>
            Section {section.section} · {section.classNumber}
            {section.component ? (
              <>
                {" "}
                ·{" "}
                <span className="text-muted-foreground">
                  {section.component}
                </span>
              </>
            ) : null}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPinIcon className="size-4 shrink-0 text-primary" aria-hidden />
          <span>{section.location || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4 shrink-0 text-primary" aria-hidden />
          <span>{section.dayTime || "—"}</span>
        </div>
        {multiLab ? (
          <div
            role="group"
            className="mt-2 space-y-2 border-l-2 border-primary/50 pl-3"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Label className="sr-only">
              {linkedPanelTitle} for this lecture meeting; choose one for add to
              cart and schedule preview. List can be collapsed to save space.
            </Label>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-background/60 py-2 pl-2 pr-2 text-left text-sm text-foreground shadow-sm backdrop-blur-sm transition hover:border-primary/35 hover:bg-background/90 dark:border-white/10 dark:bg-[rgb(12,18,32)]/85 dark:hover:bg-[rgb(14,22,38)]/95"
              onClick={(e) => {
                e.stopPropagation();
                setLabPanelOpen((o) => !o);
              }}
            >
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-primary transition-transform duration-200",
                  labPanelOpen && "rotate-180",
                )}
              />
              <span className="font-medium">
                {linkedPanelTitle}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  ({linkedLabs.length})
                </span>
              </span>
              <span className="ml-auto truncate text-xs font-normal tabular-nums text-muted-foreground">
                #{activeLab?.classNumber}
              </span>
            </button>
            <p className="pl-1 text-[11px] leading-snug text-primary/90 dark:text-primary/80">
              For cart & preview: {activeLab?.component} · {activeLab?.dayTime} ·{" "}
              {activeLab?.location}
            </p>
            {labPanelOpen ? (
              <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto rounded-lg border border-border/50 bg-card/40 p-1.5 dark:border-white/[0.08] dark:bg-[rgb(8,14,26)]/60">
                {linkedLabs.map((m) => {
                  const selected =
                    String(m.classNumber) === String(activeLabClass);
                  return (
                    <button
                      key={m.classNumber ?? m.component}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (m.classNumber != null) {
                          onLabClassChange?.(String(m.classNumber));
                        }
                      }}
                      className={cn(
                        "flex flex-col items-start rounded-md border px-3 py-2 text-left transition",
                        "border-transparent bg-transparent hover:border-border hover:bg-primary/[0.06]",
                        selected &&
                          "border-primary/40 bg-primary/[0.12] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)] dark:border-primary/50 dark:bg-primary/15",
                      )}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {m.component} · Sec {m.section ?? "—"} · #
                        {m.classNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {m.dayTime} · {m.location}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          linkedLabs.map((m, i) => (
            <div
              key={`${m.classNumber ?? m.component}-${i}`}
              className="border-t border-border/50 pt-2"
            >
              <div className="flex items-center gap-2 text-foreground">
                <BookMarkedIcon
                  className="size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>
                  {m.component}
                  {m.classNumber ? (
                    <>
                      {" "}
                      ·{" "}
                      <span className="text-muted-foreground">
                        {m.classNumber}
                      </span>
                    </>
                  ) : null}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-muted-foreground">
                <MapPinIcon
                  className="size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>{m.location}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4 shrink-0 text-primary" aria-hidden />
                <span>{m.dayTime}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        role="group"
        className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-3"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {addToCartSlot}
      </div>
    </div>
  );
}
