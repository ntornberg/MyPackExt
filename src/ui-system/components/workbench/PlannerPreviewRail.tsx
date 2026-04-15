import { useMemo } from "react";

import { CalendarView } from "../../../course-management/components/DataGridCells/CalendarView";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  type ScheduleEvent,
  CALENDAR_COLOR_CART_CLASS,
  CALENDAR_COLOR_ENROLLED_CLASS,
  CALENDAR_COLOR_PINNED_SECTION,
  CALENDAR_CONFLICT_BLOCK_SHELL,
  calendarBlockShellStyle,
} from "../../../course-management/types/Calendar";
import type { PlannerSectionPreview } from "./workbenchTypes";

type PlannerPreviewRailProps = {
  selectedPreview: PlannerSectionPreview | null;
  isOpen: boolean;
  /** Staging: mock calendar events instead of extension cache. */
  stagingOptions?: {
    calendarEvents: ScheduleEvent[];
  };
};

const normalizeRichText = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return normalized || null;
};

export function PlannerPreviewRail({
  selectedPreview,
  isOpen: _isOpen,
  stagingOptions,
}: PlannerPreviewRailProps) {
  const selectedSection = selectedPreview?.section;

  const selectedNotes = useMemo(
    () => normalizeRichText(selectedSection?.notes),
    [selectedSection?.notes],
  );
  const selectedRequisites = useMemo(
    () => normalizeRichText(selectedSection?.requisites),
    [selectedSection?.requisites],
  );

  return (
    <Card
      className={cn(
        "overflow-visible border-2 border-border bg-card text-card-foreground shadow-md ring-1 ring-border/50 dark:ring-white/12",
        "dark:bg-gradient-to-b dark:from-[rgb(9,15,27)] dark:to-[rgb(10,17,30)] dark:shadow-[inset_0_1px_0_rgba(136,164,224,0.08),0_18px_44px_rgba(0,0,0,0.28)]",
      )}
    >
      <CardHeader className="gap-2 border-b border-border/60 bg-muted/20 dark:bg-transparent">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          Preview
        </div>
        <CardTitle className="text-base font-semibold">
          {selectedPreview ? "Selected Section" : "Current MyPack Context"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {selectedPreview
            ? "Schedule, class notes, and prerequisites for the pinned section (grades and instructor stay on each row card)."
            : stagingOptions
              ? "Select a row to pin schedule context, notes, and prerequisites here."
              : "Choose a section row to pin schedule, notes, and prerequisites while you browse."}
        </p>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-4 p-3 sm:p-4">
        {selectedPreview ? (
          <div className="min-w-0 rounded-xl border border-border bg-background/55 p-3 sm:p-4">
            <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden rounded-xl border border-border bg-background/40 p-1.5 [-webkit-overflow-scrolling:touch]">
              <CalendarView
                plannerPreview
                dayTime={selectedSection?.dayTime}
                courseData={selectedSection?.courseData}
                linkedMeetings={selectedSection?.linkedMeetings}
                staticBackgroundEvents={stagingOptions?.calendarEvents}
              />
            </div>
            <ScheduleCalendarLegend className="mt-2 px-0.5" />

            {selectedNotes ? (
              <div className="mt-4 flex flex-col gap-1 rounded-lg border border-border/60 bg-background/45 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Class notes
                </div>
                <p className="text-sm text-foreground">{selectedNotes}</p>
              </div>
            ) : null}

            {selectedRequisites ? (
              <div className="mt-3 flex flex-col gap-1 rounded-lg border border-border/60 bg-background/45 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Prerequisites
                </div>
                <p className="text-sm text-foreground">{selectedRequisites}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-sm font-semibold">Schedule Preview</div>
              <p className="text-sm text-muted-foreground">
                {stagingOptions
                  ? "Sample schedule for this preview."
                  : "Live context from your current schedule."}
              </p>
            </div>
            <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden rounded-2xl border border-border bg-background/40 p-1.5 [-webkit-overflow-scrolling:touch]">
              <CalendarView
                plannerPreview
                dayTime={selectedSection?.dayTime}
                courseData={selectedSection?.courseData}
                linkedMeetings={selectedSection?.linkedMeetings}
                staticBackgroundEvents={stagingOptions?.calendarEvents}
              />
            </div>
            <ScheduleCalendarLegend className="mt-2 px-0.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScheduleCalendarLegend({ className }: { className?: string }) {
  const items = [
    { label: "Enrolled" as const, color: CALENDAR_COLOR_ENROLLED_CLASS },
    { label: "Cart" as const, color: CALENDAR_COLOR_CART_CLASS },
    { label: "Adding" as const, color: CALENDAR_COLOR_PINNED_SECTION },
    { label: "Conflict" as const },
  ] as const;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-2",
        className,
      )}
      role="list"
      aria-label="Schedule block colors"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Legend
      </span>
      {items.map((item) => {
        const shell =
          item.label === "Conflict"
            ? CALENDAR_CONFLICT_BLOCK_SHELL
            : calendarBlockShellStyle(item.color);
        return (
          <span
            key={item.label}
            role="listitem"
            className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"
          >
            <span
              className="size-2.5 shrink-0 rounded-sm shadow-sm"
              style={shell}
              aria-hidden
            />
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
