import { ChevronRight } from "lucide-react";
import { useMemo, memo } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox as ShadcnCheckbox, Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { logEvent } from "../../../analytics/ga4";
import { majorPlans } from "../../../degree-planning/DialogAutoCompleteKeys/PlanSearch/MajorPlans";
import { minorPlans } from "../../../degree-planning/DialogAutoCompleteKeys/PlanSearch/MinorPlans";
import { TermIdByName } from "../../../degree-planning/DialogAutoCompleteKeys/TermID";
import type {
  MajorPlan,
  MinorPlan,
  RequiredCourse,
  Subplan,
} from "../../../degree-planning/types/Plans";
import { CircularProgressWithLabel } from "../../../ui-system/components/shared/CircularProgressWithLabel";
import { PlannerFilterCombobox } from "../../../ui-system/components/workbench/PlannerFilterCombobox";
import { PlannerWorkbenchLayout } from "../../../ui-system/components/workbench/PlannerWorkbenchLayout";
import { formatSectionInstructors } from "../../../ui-system/components/workbench/sectionCompareUtils";
import { useOverlayPortalContainer } from "../../../ui-system/components/workbench/useOverlayPortalContainer";
import { useScheduleBackgroundEvents } from "../../../ui-system/components/workbench/useScheduleBackgroundEvents";
import { type PlannerSectionPreview } from "../../../ui-system/components/workbench/workbenchTypes";
import { AppLogger } from "../../../utils/logger";
import { fetchCourseSearchData } from "../../services/api/DialogMenuSearch/dataService";
import type { ScheduleEvent } from "../../types/Calendar";
import type { MergedCourseData } from "../../types/Section";
import { type PlanSearchData, type TabUpdater } from "../TabDataStore/TabData";

import { CourseSectionsCardList } from "./CourseSectionsCardList";

const CourseDisplay = memo(
  ({
    course,
    openCourses,
    onPreviewSectionChange,
    selectedPreviewId,
    scheduleBackground,
    instructorFilter,
    scheduleFitOnly,
  }: {
    course: RequiredCourse;
    openCourses: Record<string, MergedCourseData> | null;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    selectedPreviewId: string | null;
    scheduleBackground: ScheduleEvent[];
    instructorFilter: string | null;
    scheduleFitOnly: boolean;
  }) => {
    const courseData =
      openCourses?.[`${course.course_abr} ${course.catalog_num}`];
    const sections = courseData?.sections;

    const sectionsArray = useMemo(() => {
      if (sections && Object.keys(sections).length > 0) {
        return Object.values(sections);
      }
      return null;
    }, [sections]);

    if (sectionsArray) {
      return (
        <div className="flex h-full w-full">
          <CourseSectionsCardList
            tab="plan_search"
            sections={sectionsArray}
            rowKeyPrefix={`${course.course_abr}-${course.catalog_num}-`}
            selectedPreviewId={selectedPreviewId}
            onPreviewSectionChange={onPreviewSectionChange}
            instructorFilter={instructorFilter}
            scheduleFitOnly={scheduleFitOnly}
            scheduleBackground={scheduleBackground}
          />
        </div>
      );
    }

    return (
      <p className="p-3 text-center text-base italic text-muted-foreground">
        No sections available
      </p>
    );
  },
);

/**
 * Major/Minor Plan Search tab for fetching and displaying open sections for degree plan requirements.
 *
 * @param props Tab state setter and current state
 * @returns {JSX.Element} Plan Search tab UI
 */
export default function PlanSearch({
  setPlanSearchTabData,
  planSearchData,
  onPreviewSectionChange,
  previewContent,
  selectedPreviewId,
}: {
  setPlanSearchTabData: TabUpdater<PlanSearchData>;
  planSearchData: PlanSearchData;
  onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
  previewContent: React.ReactNode;
  selectedPreviewId: string | null;
}) {
  const major_options = useMemo(() => Object.keys(majorPlans), []);
  const minor_options = useMemo(() => Object.keys(minorPlans), []);
  const portalContainer = useOverlayPortalContainer();
  const scheduleBackground = useScheduleBackgroundEvents();

  const planInstructorOptions = useMemo(() => {
    const names = new Set<string>();
    const courses = planSearchData.openCourses as Record<
      string,
      MergedCourseData
    >;
    for (const c of Object.values(courses)) {
      if (!c?.sections) {
        continue;
      }
      for (const g of Object.values(c.sections)) {
        const lec = g.lecture;
        if (!lec) {
          continue;
        }
        const s = formatSectionInstructors(lec).trim();
        if (s) {
          names.add(s);
        }
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [planSearchData.openCourses]);
  const subplanOptions = planSearchData.selectedMajor
    ? Object.keys(
        majorPlans[planSearchData.selectedMajor as keyof typeof majorPlans]
          ?.subplans || {},
      )
    : [];
  const isSearchDisabled =
    !planSearchData.selectedTerm ||
    !(
      planSearchData.selectedMinor ||
      (planSearchData.selectedMajor && planSearchData.selectedSubplan)
    );

  const planSearch = async () => {
    logEvent("plan_search_clicked", {
      tab: "plan_search",
      term: planSearchData.selectedTerm ?? "unknown",
      major: planSearchData.selectedMajor ?? "unknown",
      minor: planSearchData.selectedMinor ?? "unknown",
      subplan: planSearchData.selectedSubplan ?? "unknown",
    }).catch(() => {
      // Silently ignore analytics errors
    });
    onPreviewSectionChange(null);
    setPlanSearchTabData({
      progress: 10,
      progressLabel: "Initializing plan search...",
      searchMajor: planSearchData.selectedMajor,
      searchMinor: planSearchData.selectedMinor,
      searchSubplan: planSearchData.selectedSubplan,
      isLoaded: false,
      openCourses: {},
    });
    AppLogger.info("Search clicked with:", {
      selectedMajor: planSearchData.selectedMajor,
      selectedSubplan: planSearchData.selectedSubplan,
      selectedTerm: planSearchData.selectedTerm,
    });
    // Call the async logic
    await fetchOpenCourses(
      planSearchData.selectedMajor,
      planSearchData.selectedMinor,
      planSearchData.selectedSubplan,
      planSearchData.selectedTerm,
    );
    setPlanSearchTabData({
      progress: 100,
      progressLabel: "Complete",
    });
  };

  const fetchOpenCourses = async (
    major: string | null,
    minor: string | null,
    subplan: string | null,
    term: string | null,
  ) => {
    setPlanSearchTabData({
      progress: 10,
      progressLabel: `Preparing to search for ${major} - ${subplan} courses`,
    });
    AppLogger.info("fetchOpenCourses called with:", { major, subplan, term });

    if (((major && subplan) || minor) && term) {
      try {
        setPlanSearchTabData({
          progress: 15,
          progressLabel: `Loading ${major} plan data`,
        });
        const major_data = majorPlans[
          major as keyof typeof majorPlans
        ] as MajorPlan;
        const subplan_data = major_data?.subplans[
          subplan as keyof typeof major_data.subplans
        ] as Subplan | undefined;
        const minor_data = minorPlans[minor as keyof typeof minorPlans] as
          | MinorPlan
          | undefined;
        if (!subplan_data && !minor_data) {
          AppLogger.error("No subplan data found for", subplan);
          setPlanSearchTabData(
            "progressLabel",
            `Error: No data found for ${subplan}`,
          );
          return;
        }

        const major_requirements = subplan_data?.requirements ?? {};
        const minor_requirements = minor_data?.requirements ?? {};
        const requirements = { ...minor_requirements, ...major_requirements };
        const reqCount = Object.keys(requirements).length;
        setPlanSearchTabData({
          progress: 20,
          progressLabel: `Processing ${reqCount} requirements for ${subplan}`,
        });
        AppLogger.info("Requirements:", Object.keys(requirements));

        const newOpenCourses: Record<string, MergedCourseData> = {};

        // Pass progress callback with status message support
        const data = await fetchCourseSearchData(
          Object.values(requirements),
          term,
          (progressVal, statusMessage) => {
            setPlanSearchTabData({
              progress: 20 + Math.round(progressVal * 0.7),
              ...(statusMessage ? { progressLabel: statusMessage } : {}),
            });
          },
        );

        if (!data) {
          AppLogger.error("No data returned from fetchCourseSearchData");
          setPlanSearchTabData(
            "progressLabel",
            `Error: No course data found for ${major} - ${subplan}`,
          );
          return;
        }

        AppLogger.info("Data returned from API:", data);
        setPlanSearchTabData({
          progress: 90,
          progressLabel: "Processing course sections",
        });

        for (const [courseKey, course] of Object.entries(data)) {
          newOpenCourses[courseKey] = course;
        }

        setPlanSearchTabData({
          progress: 95,
          progressLabel: "Finalizing search results",
        });
        AppLogger.info("Setting openCourses with:", newOpenCourses);
        setPlanSearchTabData({
          isLoaded: true,
          openCourses: newOpenCourses,
        });
        AppLogger.info("Updated open courses:", newOpenCourses);
      } catch (error) {
        AppLogger.error("Error in fetchOpenCourses:", error);
        setPlanSearchTabData(
          "progressLabel",
          `Error fetching courses: ${error}`,
        );
      } finally {
        setPlanSearchTabData({
          progress: 100,
          progressLabel: "Complete",
        });
      }
    }
  };

  const requirements = useMemo(() => {
    if (
      !(
        (planSearchData.selectedMajor && planSearchData.selectedSubplan) ||
        planSearchData.selectedMinor
      ) ||
      !planSearchData.selectedTerm
    ) {
      return {} as Record<string, { courses: readonly RequiredCourse[] }>;
    }

    const major_data = majorPlans[
      planSearchData.selectedMajor as keyof typeof majorPlans
    ] as MajorPlan;
    const subplan_data = major_data?.subplans[
      planSearchData.selectedSubplan as keyof typeof major_data.subplans
    ] as Subplan | undefined;
    const minor_data = minorPlans[
      planSearchData.selectedMinor as keyof typeof minorPlans
    ] as MinorPlan | undefined;
    const major_requirements = subplan_data?.requirements ?? {};
    const minor_requirements = minor_data?.requirements ?? {};

    return {
      ...minor_requirements,
      ...major_requirements,
    } as Record<string, { courses: readonly RequiredCourse[] }>;
  }, [
    planSearchData.selectedMajor,
    planSearchData.selectedSubplan,
    planSearchData.selectedMinor,
    planSearchData.selectedTerm,
  ]);

  const requirementEntries = useMemo(
    () =>
      Object.entries(requirements)
        .map(([requirementKey, requirement]) => ({
          requirementKey,
          courses: requirement.courses.filter((course: RequiredCourse) => {
            if (!planSearchData.hideNoSections) {
              return true;
            }
            const courseData = (
              planSearchData.openCourses as Record<string, MergedCourseData>
            )?.[`${course.course_abr} ${course.catalog_num}`];
            return (
              !!courseData?.sections &&
              Object.keys(courseData.sections).length > 0
            );
          }),
        }))
        .filter(({ courses }) => courses.length > 0),
    [requirements, planSearchData.hideNoSections, planSearchData.openCourses],
  );
  const hasPlanSearchRun = Boolean(
    planSearchData.isLoaded &&
      (planSearchData.searchMajor || planSearchData.searchMinor),
  );

  const requirementListKey = useMemo(
    () => requirementEntries.map((e) => e.requirementKey).join("\u0001"),
    [requirementEntries],
  );

  const requirementsList = useMemo(() => {
    if (requirementEntries.length === 0) {
      return null;
    }

    return (
      <div key={requirementListKey} className="flex flex-col gap-2">
        {requirementEntries.map(({ requirementKey, courses }) => (
          <details
            key={requirementKey}
            className="plan-req-disclosure overflow-hidden rounded-lg border border-border bg-card/50 shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
              <ChevronRight
                className="plan-req-chevron size-4 shrink-0 text-muted-foreground transition-transform duration-200"
                aria-hidden
              />
              <span className="min-w-0 flex-1">{requirementKey}</span>
            </summary>
            <div className="flex w-full flex-col border-t border-border px-4 pt-2 pb-4">
              {courses.map((course: RequiredCourse, index: number) => (
                <div
                  key={`${course.course_abr} ${course.catalog_num}`}
                  className="mb-3"
                >
                  <h6 className="mb-2 border-b border-border pb-1 text-base font-medium text-foreground">
                    {course.course_descrip} ({course.course_abr}{" "}
                    {parseInt(course.catalog_num)})
                  </h6>

                  <div className="mb-2 w-full">
                    <CourseDisplay
                      course={course}
                      openCourses={planSearchData.openCourses}
                      onPreviewSectionChange={onPreviewSectionChange}
                      selectedPreviewId={selectedPreviewId}
                      scheduleBackground={scheduleBackground}
                      instructorFilter={planSearchData.instructorFilter}
                      scheduleFitOnly={planSearchData.scheduleFitOnly}
                    />
                  </div>

                  {index < courses.length - 1 && (
                    <div className="my-3 h-px w-full bg-border" />
                  )}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    );
  }, [
    onPreviewSectionChange,
    planSearchData.instructorFilter,
    planSearchData.openCourses,
    planSearchData.scheduleFitOnly,
    requirementEntries,
    requirementListKey,
    scheduleBackground,
    selectedPreviewId,
  ]);

  const controlsPanel = (
    <Card className="overflow-visible bg-card/80 shadow-sm">
      <CardHeader className="gap-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-primary/75">
          Major Search
        </div>
        <CardTitle className="text-base">Parameters</CardTitle>
        <CardDescription>
          Open requirement groups, compare live sections, and keep schedule
          context visible while you browse.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="term_selector">Term</FieldLabel>
            <PlannerFilterCombobox
              items={Object.keys(TermIdByName)}
              value={planSearchData.selectedTerm}
              onValueChange={(value) =>
                setPlanSearchTabData("selectedTerm", value)
              }
              placeholder="Select term"
              emptyLabel="No terms found."
              portalContainer={portalContainer}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="major_selector">Major</FieldLabel>
            <PlannerFilterCombobox
              items={major_options}
              value={planSearchData.selectedMajor}
              onValueChange={(value) =>
                setPlanSearchTabData("selectedMajor", value)
              }
              placeholder="Select major"
              emptyLabel="No majors found."
              portalContainer={portalContainer}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="minor_selector">Minor</FieldLabel>
            <PlannerFilterCombobox
              items={minor_options}
              value={planSearchData.selectedMinor}
              onValueChange={(value) =>
                setPlanSearchTabData("selectedMinor", value)
              }
              placeholder="Select minor"
              emptyLabel="No minors found."
              portalContainer={portalContainer}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="subplan_selector">Subplan</FieldLabel>
            <PlannerFilterCombobox
              items={subplanOptions}
              value={planSearchData.selectedSubplan}
              onValueChange={(value) =>
                setPlanSearchTabData("selectedSubplan", value)
              }
              placeholder="Select subplan"
              emptyLabel="No subplans found."
              disabled={!planSearchData.selectedMajor}
              portalContainer={portalContainer}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="plan_instructor_filter">Instructor</FieldLabel>
            <PlannerFilterCombobox
              items={planInstructorOptions}
              value={planSearchData.instructorFilter}
              onValueChange={(value) =>
                setPlanSearchTabData("instructorFilter", value)
              }
              placeholder="Any instructor"
              emptyLabel="Run search to load instructors."
              disabled={planInstructorOptions.length === 0}
              portalContainer={portalContainer}
            />
            <FieldDescription>
              Optional: limit section lists to one instructor.
            </FieldDescription>
          </Field>
          <Field>
            <div className="flex items-start gap-3 rounded-lg border-2 border-border bg-card p-3.5 shadow-sm dark:bg-card/95">
              <Checkbox
                id="plan-schedule-fit"
                checked={planSearchData.scheduleFitOnly}
                onCheckedChange={(v) =>
                  setPlanSearchTabData("scheduleFitOnly", v === true)
                }
                aria-describedby="plan-schedule-fit-desc"
                className="mt-0.5 size-5 rounded-md border-2 border-foreground/40 bg-background shadow-sm dark:border-foreground/50 dark:bg-muted/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              />
              <div className="min-w-0 space-y-1">
                <FieldLabel
                  htmlFor="plan-schedule-fit"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  Fits my schedule
                </FieldLabel>
                <FieldDescription id="plan-schedule-fit-desc">
                  Hide sections that overlap classes in your cart or enrolled
                  schedule.
                </FieldDescription>
              </div>
            </div>
          </Field>
          <Button
            onClick={planSearch}
            disabled={isSearchDisabled}
            className="w-full origin-center font-semibold motion-safe:duration-150 motion-safe:ease-out motion-safe:hover:scale-[1.01] motion-safe:active:scale-[1.04] active:!translate-y-0"
          >
            Search
          </Button>
          <Field orientation="horizontal">
            <ShadcnCheckbox
              checked={planSearchData.hideNoSections}
              onCheckedChange={(checked) =>
                setPlanSearchTabData("hideNoSections", Boolean(checked))
              }
              id="hide-empty-plan"
            />
            <FieldLabel htmlFor="hide-empty-plan" className="font-normal">
              Hide courses with no open sections
            </FieldLabel>
          </Field>
        </FieldGroup>
        {!planSearchData.isLoaded ? (
          <div className="mt-4 flex w-full justify-center">
            <CircularProgressWithLabel
              value={planSearchData.progress}
              label={planSearchData.progressLabel || ""}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  const resultsPanel = (
    <Card className="min-w-0 overflow-visible bg-card/80 shadow-sm">
      <CardHeader className="gap-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Comparison Workspace
        </div>
        <CardTitle className="text-base">Requirement Tree</CardTitle>
      </CardHeader>
      <CardContent>
        {hasPlanSearchRun && requirementsList ? (
          requirementsList
        ) : (
          <p className="p-3 text-center text-muted-foreground">
            No search results found for the selected plan and filters.
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <PlannerWorkbenchLayout
      controls={controlsPanel}
      results={resultsPanel}
      preview={previewContent}
    />
  );
}
