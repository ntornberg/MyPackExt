import {
  MoonStarIcon,
  SearchIcon,
  ShoppingCartIcon,
  SunMediumIcon,
} from "lucide-react";
import { type MouseEvent, useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlannerFilterCombobox } from "@/ui-system/components/workbench/PlannerFilterCombobox";
import { PlannerPreviewRail } from "@/ui-system/components/workbench/PlannerPreviewRail";
import { PlannerWorkbenchLayout } from "@/ui-system/components/workbench/PlannerWorkbenchLayout";
import { SectionCompareCard } from "@/ui-system/components/workbench/SectionCompareCard";
import { SectionCompareList } from "@/ui-system/components/workbench/SectionCompareList";
import { useOverlayPortalContainer } from "@/ui-system/components/workbench/useOverlayPortalContainer";
import {
  createSectionPreview,
  type PlannerSectionPreview,
} from "@/ui-system/components/workbench/workbenchTypes";

import type { ScheduleEvent } from "../course-management/types/Calendar";
import { sectionFitsSchedule } from "../course-management/utils/scheduleFitFilter";

import {
  plannerCalendarBackgroundForFit,
  plannerStagingTabs,
  type StagingResult,
  type StagingTabId,
} from "./plannerDebugData";
import {
  stagingResultToModifiedSection,
  stagingResultToRowDisplaySection,
} from "./stagingPreviewAdapter";

function stagingLabChoice(
  result: StagingResult,
  picks: Record<string, string>,
): string | undefined {
  const labs = result.linkedMeetings ?? [];
  if (labs.length <= 1) {
    return undefined;
  }
  return picks[result.id] ?? String(labs[0]!.classNumber);
}

function buildStagingPreview(
  tab: StagingTabId,
  result: StagingResult,
  picks: Record<string, string>,
): PlannerSectionPreview {
  return createSectionPreview(
    tab,
    stagingResultToModifiedSection(result, {
      selectedLabClassNumber: stagingLabChoice(result, picks),
    }),
  );
}

function filterStagingResults(
  results: StagingResult[],
  tabId: StagingTabId,
  primary: string | null,
  secondary: string | null,
  tertiary: string | null,
  applySubjectFilters: boolean,
  teacher: string | null,
  scheduleFitOnly: boolean,
  scheduleBackground: ScheduleEvent[],
): StagingResult[] {
  return results.filter((r) => {
    if (applySubjectFilters && primary) {
      if (tabId === "course_search") {
        const dept =
          primary.split(" - ")[0]?.trim() ??
          primary.split(" -")[0]?.trim() ??
          "";
        if (
          dept &&
          !r.courseCode.toUpperCase().startsWith(dept.toUpperCase())
        ) {
          return false;
        }
      } else {
        const words = primary
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        if (words.length > 0) {
          const blob =
            `${r.title} ${r.tags.join(" ")} ${r.courseCode}`.toLowerCase();
          if (!words.some((w) => blob.includes(w))) {
            return false;
          }
        }
      }
    }
    if (applySubjectFilters && secondary) {
      const m = secondary.match(/^([A-Za-z]{2,4})\s+(\d{3}[A-Za-z]?)/i);
      if (m) {
        const expected = `${m[1]} ${m[2]}`.toUpperCase();
        const codeNorm = r.courseCode.replace(/\s+/g, " ").toUpperCase();
        if (!codeNorm.startsWith(expected)) {
          return false;
        }
      } else if (tabId === "course_search") {
        if (
          !secondary.toLowerCase().includes(r.courseCode.toLowerCase()) &&
          !r.title.toLowerCase().includes(secondary.slice(0, 24).toLowerCase())
        ) {
          return false;
        }
      } else {
        const blob = `${r.title} ${r.tags.join(" ")}`.toLowerCase();
        const tokens = secondary
          .toLowerCase()
          .split(/\s+/)
          .map((w) => w.replace(/[^a-z0-9]/g, ""))
          .filter((w) => w.length > 3);
        if (tokens.length > 0 && !tokens.some((t) => blob.includes(t))) {
          return false;
        }
      }
    }
    if (applySubjectFilters && tabId === "plan_search" && tertiary) {
      const t = tertiary.toLowerCase();
      if (
        !r.tags.some((tag) => tag.toLowerCase().includes(t)) &&
        !r.title.toLowerCase().includes(t)
      ) {
        return false;
      }
    }
    if (teacher && r.instructor.trim() !== teacher) {
      return false;
    }
    if (
      scheduleFitOnly &&
      !sectionFitsSchedule(r.schedule ?? [], scheduleBackground)
    ) {
      return false;
    }
    return true;
  });
}

export function PlannerStagingApp() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [selectedTab, setSelectedTab] = useState<StagingTabId>("course_search");
  const portalContainer = useOverlayPortalContainer();

  const currentTab =
    plannerStagingTabs.find((tab) => tab.id === selectedTab) ??
    plannerStagingTabs[0];

  const [term, setTerm] = useState<string | null>(
    currentTab.filters.term[0] ?? null,
  );
  const [primaryFilter, setPrimaryFilter] = useState<string | null>(
    currentTab.filters.primary[0] ?? null,
  );
  const [secondaryFilter, setSecondaryFilter] = useState<string | null>(
    currentTab.filters.secondary[0] ?? null,
  );
  const [tertiaryFilter, setTertiaryFilter] = useState<string | null>(
    currentTab.filters.tertiary?.[0] ?? null,
  );
  const [teacherFilter, setTeacherFilter] = useState<string | null>(null);
  const [scheduleFitOnly, setScheduleFitOnly] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPreview, setSelectedPreview] =
    useState<PlannerSectionPreview | null>(() =>
      buildStagingPreview(
        "course_search",
        plannerStagingTabs[0].results[0]!,
        {},
      ),
    );
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  /** When a staging row has multiple labs, which class # is paired for the mock “add to cart”. */
  const [stagingLabClassByResultId, setStagingLabClassByResultId] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    document.documentElement.setAttribute("data-pp-mode", themeMode);
    const overlayRoot = document.getElementById("extension-overlay-root");
    if (!overlayRoot) {
      return;
    }
    overlayRoot.setAttribute("data-mpp-theme", themeMode);
    overlayRoot.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  useEffect(() => {
    if (!cartNotice) {
      return;
    }
    const t = window.setTimeout(() => setCartNotice(null), 3200);
    return () => window.clearTimeout(t);
  }, [cartNotice]);

  const instructorOptions = useMemo(() => {
    const names = new Set<string>();
    for (const r of currentTab.results) {
      const name = r.instructor?.trim();
      if (name) {
        names.add(name);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [currentTab.results]);

  const filteredResults = useMemo(
    () =>
      filterStagingResults(
        currentTab.results,
        selectedTab,
        primaryFilter,
        secondaryFilter,
        tertiaryFilter,
        hasSearched,
        teacherFilter,
        scheduleFitOnly,
        plannerCalendarBackgroundForFit,
      ),
    [
      currentTab.results,
      hasSearched,
      primaryFilter,
      scheduleFitOnly,
      secondaryFilter,
      selectedTab,
      teacherFilter,
      tertiaryFilter,
    ],
  );

  const selectTab = (tabId: StagingTabId) => {
    setSelectedTab(tabId);
    const nextTab =
      plannerStagingTabs.find((tab) => tab.id === tabId) ??
      plannerStagingTabs[0];
    setTerm(nextTab.filters.term[0] ?? null);
    setPrimaryFilter(nextTab.filters.primary[0] ?? null);
    setSecondaryFilter(nextTab.filters.secondary[0] ?? null);
    setTertiaryFilter(nextTab.filters.tertiary?.[0] ?? null);
    setTeacherFilter(null);
    setScheduleFitOnly(false);
    setHasSearched(false);
    setStagingLabClassByResultId({});
    const first = nextTab.results[0];
    setSelectedPreview(first ? buildStagingPreview(tabId, first, {}) : null);
  };

  const runSearch = () => {
    setHasSearched(true);
    const next = filterStagingResults(
      currentTab.results,
      selectedTab,
      primaryFilter,
      secondaryFilter,
      tertiaryFilter,
      true,
      teacherFilter,
      scheduleFitOnly,
      plannerCalendarBackgroundForFit,
    );
    const first = next[0];
    if (first) {
      setSelectedPreview(
        buildStagingPreview(selectedTab, first, stagingLabClassByResultId),
      );
    } else {
      setSelectedPreview(null);
    }
  };

  const selectResult = (result: StagingResult) => {
    setSelectedPreview(
      buildStagingPreview(selectedTab, result, stagingLabClassByResultId),
    );
  };

  const addStagingToCart = (result: StagingResult, e: MouseEvent) => {
    e.stopPropagation();
    const labs = result.linkedMeetings ?? [];
    const chosenLabClass =
      labs.length > 1
        ? (stagingLabClassByResultId[result.id] ?? labs[0]?.classNumber)
        : labs.length === 1
          ? labs[0]!.classNumber
          : null;
    const labPart =
      chosenLabClass != null ? ` with lab class #${chosenLabClass}` : "";
    setCartNotice(
      `Staging: would add ${result.courseCode} lecture #${result.classNumber}${labPart} to cart (MyPack not available here).`,
    );
  };

  /** Cart + enrolled only; browsed section is drawn via `dayTime` → green pin (no duplicate blue blocks). */
  const scheduleEvents = useMemo(
    () => [...plannerCalendarBackgroundForFit],
    [],
  );

  const previewStagingOptions = useMemo(
    () => ({
      calendarEvents: scheduleEvents,
    }),
    [scheduleEvents],
  );

  const controlsPanel = (
    <Card className="overflow-visible bg-card/80 shadow-sm">
      <CardHeader className="gap-1 pb-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          {currentTab.eyebrow}
        </div>
        <CardTitle className="text-base">Search</CardTitle>
        <CardDescription className="text-muted-foreground">
          {currentTab.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="staging-term">Term</FieldLabel>
            <PlannerFilterCombobox
              items={currentTab.filters.term}
              value={term}
              onValueChange={setTerm}
              placeholder="Select term"
              emptyLabel="No terms found."
              portalContainer={portalContainer}
            />
            <FieldDescription>
              Term selection is visual-only; filters below drive the result
              list.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="staging-primary">Subject / area</FieldLabel>
            <PlannerFilterCombobox
              items={currentTab.filters.primary}
              value={primaryFilter}
              onValueChange={setPrimaryFilter}
              placeholder="Choose subject or area"
              emptyLabel="No options found."
              portalContainer={portalContainer}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="staging-secondary">
              Course / requirement
            </FieldLabel>
            <PlannerFilterCombobox
              items={currentTab.filters.secondary}
              value={secondaryFilter}
              onValueChange={setSecondaryFilter}
              placeholder="Choose course or requirement"
              emptyLabel="No options found."
              portalContainer={portalContainer}
            />
          </Field>
          {currentTab.filters.tertiary ? (
            <Field>
              <FieldLabel htmlFor="staging-tertiary">Focus</FieldLabel>
              <PlannerFilterCombobox
                items={currentTab.filters.tertiary}
                value={tertiaryFilter}
                onValueChange={setTertiaryFilter}
                placeholder="Optional focus"
                emptyLabel="No options found."
                portalContainer={portalContainer}
              />
            </Field>
          ) : null}
          <Field>
            <FieldLabel htmlFor="staging-instructor">Instructor</FieldLabel>
            <PlannerFilterCombobox
              items={instructorOptions}
              value={teacherFilter}
              onValueChange={setTeacherFilter}
              placeholder="Any instructor"
              emptyLabel="No instructors in this tab."
              disabled={instructorOptions.length === 0}
              portalContainer={portalContainer}
            />
            <FieldDescription>
              Optional: show only rows for this instructor (updates as you
              change it).
            </FieldDescription>
          </Field>
          <Field>
            <div className="flex items-start gap-3 rounded-lg border-2 border-border bg-card p-3.5 shadow-sm dark:bg-card/95">
              <Checkbox
                id="staging-schedule-fit"
                checked={scheduleFitOnly}
                onCheckedChange={(v) => setScheduleFitOnly(v === true)}
                aria-describedby="staging-schedule-fit-desc"
                className="mt-0.5 size-5 rounded-md border-2 border-foreground/40 bg-background shadow-sm dark:border-foreground/50 dark:bg-muted/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              />
              <div className="min-w-0 space-y-1">
                <FieldLabel
                  htmlFor="staging-schedule-fit"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  Fits my schedule
                </FieldLabel>
                <FieldDescription id="staging-schedule-fit-desc">
                  Hide sections that overlap enrolled or cart blocks on the
                  calendar (see the preview legend).
                </FieldDescription>
              </div>
            </div>
          </Field>
          <Button className="w-full font-semibold" onClick={runSearch}>
            <SearchIcon data-icon="inline-start" />
            Search
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  );

  const resultsPanel = (
    <Card className="overflow-visible bg-card/80 shadow-sm">
      <CardHeader className="gap-1 pb-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Comparison workspace
        </div>
        <CardTitle className="text-base">Sections</CardTitle>
        <CardDescription>
          {hasSearched
            ? `${filteredResults.length} result${filteredResults.length === 1 ? "" : "s"} after filters.`
            : "Browse all rows below. PY 208: open Lab sections under the lecture times to pick a lab, then Add to cart."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <SectionCompareList
          isEmpty={filteredResults.length === 0}
          emptyMessage="No sections match the current filters. Adjust subject, course, instructor, or schedule-fit options and run Search again."
          header={
            cartNotice ? (
              <Alert>
                <AlertTitle>Cart (staging)</AlertTitle>
                <AlertDescription>{cartNotice}</AlertDescription>
              </Alert>
            ) : null
          }
        >
          {filteredResults.map((result) => (
            <SectionCompareCard
              key={result.id}
              section={stagingResultToRowDisplaySection(result)}
              isSelected={selectedPreview?.section.id === result.id}
              onSelect={() => selectResult(result)}
              selectedLabClassNumber={
                (result.linkedMeetings?.length ?? 0) > 1
                  ? (stagingLabClassByResultId[result.id] ??
                    result.linkedMeetings![0]!.classNumber!)
                  : undefined
              }
              onLabClassChange={(classNbr) => {
                const next = {
                  ...stagingLabClassByResultId,
                  [result.id]: classNbr,
                };
                setStagingLabClassByResultId(next);
                setSelectedPreview(
                  buildStagingPreview(selectedTab, result, next),
                );
              }}
              addToCartSlot={
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="pointer-events-auto shrink-0 gap-2 rounded-lg border-0 bg-gradient-to-b from-primary via-primary to-primary/88 px-3.5 font-semibold text-primary-foreground transition-[transform,filter] hover:brightness-[1.03] active:translate-y-px"
                  onClick={(e) => {
                    e.stopPropagation();
                    addStagingToCart(result, e);
                  }}
                >
                  <ShoppingCartIcon
                    className="size-4 opacity-95"
                    strokeWidth={2.25}
                  />
                  Add to cart
                </Button>
              }
            />
          ))}
        </SectionCompareList>
      </CardContent>
    </Card>
  );

  const previewPanel = (
    <PlannerPreviewRail
      selectedPreview={selectedPreview}
      isOpen
      stagingOptions={previewStagingOptions}
    />
  );

  return (
    <div
      id="extension-overlay-root"
      className="min-h-screen w-full px-4 py-6 sm:px-6 sm:py-8"
      style={{
        background:
          themeMode === "dark"
            ? "radial-gradient(ellipse 120% 80% at 50% -20%, #1a2d52 0%, #0a1220 45%, #060a12 100%)"
            : "linear-gradient(180deg, #e8eef8 0%, #f4f7fb 100%)",
      }}
    >
      <div
        className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1680px] flex-col overflow-hidden rounded-2xl border-2 border-border bg-card text-card-foreground shadow-lg ring-1 ring-border/50 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)] dark:ring-white/12 sm:rounded-[28px]"
        data-mpp-theme={themeMode}
      >
        <div
          className={`flex min-h-0 flex-1 flex-col ${themeMode === "dark" ? "dark" : ""}`}
        >
          <header className="shrink-0 border-b border-border/60 bg-muted/25 px-4 py-4 sm:px-6 sm:py-5 dark:bg-background/40">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Pack Planner
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-foreground/70 dark:text-muted-foreground">
                  Same layout as the extension planner. Use Search to filter,
                  then pick a row to pin the preview.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setThemeMode((current) =>
                    current === "dark" ? "light" : "dark",
                  )
                }
              >
                {themeMode === "dark" ? (
                  <SunMediumIcon data-icon="inline-start" />
                ) : (
                  <MoonStarIcon data-icon="inline-start" />
                )}
                {themeMode === "dark" ? "Light" : "Dark"}
              </Button>
            </div>
            <div className="mt-4">
              <Tabs
                value={selectedTab}
                onValueChange={(value) => selectTab(value as StagingTabId)}
              >
                <TabsList
                  variant="segmented"
                  className="w-full min-w-0 sm:min-h-12 sm:max-w-2xl"
                  aria-label="Planner search tabs"
                >
                  {plannerStagingTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="min-w-0 truncate"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-auto">
            <PlannerWorkbenchLayout
              controls={controlsPanel}
              results={resultsPanel}
              preview={previewPanel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
