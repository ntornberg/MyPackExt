import { ChevronRight } from "lucide-react";
import { useCallback, useMemo, memo } from "react";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import type {
  MajorPlan,
  MinorPlan,
  RequiredCourse,
  Subplan,
} from "../../../degree-planning/types/Plans";
import { majorPlans } from "../../../generated/catalogs/major-plan-search/majorPlans";
import { minorPlans } from "../../../generated/catalogs/major-plan-search/minorPlans";
import { TermIdByName } from "../../../generated/catalogs/termIds";
import {
  HideEmptySectionsField,
  ScheduleFitField,
  SearchSubmitButton,
} from "../../../ui-system/components/planner/PlannerControls";
import { PlannerPanel } from "../../../ui-system/components/planner/PlannerPanel";
import { CircularProgressWithLabel } from "../../../ui-system/components/shared/CircularProgressWithLabel";
import { PlannerFilterCombobox } from "../../../ui-system/components/workbench/PlannerFilterCombobox";
import { PlannerWorkbenchLayout } from "../../../ui-system/components/workbench/PlannerWorkbenchLayout";
import { formatSectionInstructors } from "../../../ui-system/components/workbench/sectionCompareUtils";
import { SectionDensityToggle } from "../../../ui-system/components/workbench/SectionDensityToggle";
import { useOverlayPortalContainer } from "../../../ui-system/components/workbench/useOverlayPortalContainer";
import { useScheduleBackgroundEvents } from "../../../ui-system/components/workbench/useScheduleBackgroundEvents";
import { type PlannerSectionPreview } from "../../../ui-system/components/workbench/workbenchTypes";
import { AppLogger } from "../../../utils/logger";
import { fetchCourseSearchData } from "../../services/api/planner-search/dataService";
import type { ScheduleEvent } from "../../types/calendar";
import type { MergedCourseData } from "../../types/section";
import {
  type MajorPlanSearchData,
  type TabUpdater,
} from "../tab-state/tabState";

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
    compactSections,
  }: {
    course: RequiredCourse;
    openCourses: Record<string, MergedCourseData> | null;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    selectedPreviewId: string | null;
    scheduleBackground: ScheduleEvent[];
    instructorFilter: string | null;
    scheduleFitOnly: boolean;
    compactSections: boolean;
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
            tab="major_plan_search"
            sections={sectionsArray}
            rowKeyPrefix={`${course.course_abr}-${course.catalog_num}-`}
            selectedPreviewId={selectedPreviewId}
            onPreviewSectionChange={onPreviewSectionChange}
            instructorFilter={instructorFilter}
            scheduleFitOnly={scheduleFitOnly}
            scheduleBackground={scheduleBackground}
            compact={compactSections}
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
export default function MajorPlanSearch({
  setMajorPlanSearchTabData,
  majorPlanSearchData,
  onPreviewSectionChange,
  previewContent,
  selectedPreviewId,
}: {
  setMajorPlanSearchTabData: TabUpdater<MajorPlanSearchData>;
  majorPlanSearchData: MajorPlanSearchData;
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
    const courses = majorPlanSearchData.openCourses as Record<
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
  }, [majorPlanSearchData.openCourses]);
  const subplanOptions = majorPlanSearchData.selectedMajor
    ? Object.keys(
        majorPlans[majorPlanSearchData.selectedMajor as keyof typeof majorPlans]
          ?.subplans || {},
      )
    : [];
  const isSearchDisabled =
    !majorPlanSearchData.selectedTerm ||
    !(
      majorPlanSearchData.selectedMinor ||
      (majorPlanSearchData.selectedMajor && majorPlanSearchData.selectedSubplan)
    );

  const handleTermChange = useCallback(
    (value: string | null) => {
      setMajorPlanSearchTabData({
        selectedTerm: value,
        instructorFilter: null,
      });
      onPreviewSectionChange(null);
    },
    [onPreviewSectionChange, setMajorPlanSearchTabData],
  );

  const handleMajorChange = useCallback(
    (value: string | null) => {
      setMajorPlanSearchTabData({
        selectedMajor: value,
        selectedSubplan: null,
        instructorFilter: null,
      });
      onPreviewSectionChange(null);
    },
    [onPreviewSectionChange, setMajorPlanSearchTabData],
  );

  const handleMinorChange = useCallback(
    (value: string | null) => {
      setMajorPlanSearchTabData({
        selectedMinor: value,
        instructorFilter: null,
      });
      onPreviewSectionChange(null);
    },
    [onPreviewSectionChange, setMajorPlanSearchTabData],
  );

  const handleSubplanChange = useCallback(
    (value: string | null) => {
      setMajorPlanSearchTabData({
        selectedSubplan: value,
        instructorFilter: null,
      });
      onPreviewSectionChange(null);
    },
    [onPreviewSectionChange, setMajorPlanSearchTabData],
  );

  const runMajorPlanSearch = async () => {
    onPreviewSectionChange(null);
    setMajorPlanSearchTabData({
      progress: 10,
      progressLabel: "Initializing plan search...",
      searchMajor: majorPlanSearchData.selectedMajor,
      searchMinor: majorPlanSearchData.selectedMinor,
      searchSubplan: majorPlanSearchData.selectedSubplan,
      isLoaded: false,
      openCourses: {},
    });
    AppLogger.info("Search clicked with:", {
      selectedMajor: majorPlanSearchData.selectedMajor,
      selectedSubplan: majorPlanSearchData.selectedSubplan,
      selectedTerm: majorPlanSearchData.selectedTerm,
    });
    // Call the async logic
    await fetchOpenCourses(
      majorPlanSearchData.selectedMajor,
      majorPlanSearchData.selectedMinor,
      majorPlanSearchData.selectedSubplan,
      majorPlanSearchData.selectedTerm,
    );
    setMajorPlanSearchTabData({
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
    setMajorPlanSearchTabData({
      progress: 10,
      progressLabel: `Preparing to search for ${major} - ${subplan} courses`,
    });
    AppLogger.info("fetchOpenCourses called with:", { major, subplan, term });

    if (((major && subplan) || minor) && term) {
      try {
        setMajorPlanSearchTabData({
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
          setMajorPlanSearchTabData(
            "progressLabel",
            `Error: No data found for ${subplan}`,
          );
          return;
        }

        const major_requirements = subplan_data?.requirements ?? {};
        const minor_requirements = minor_data?.requirements ?? {};
        const requirements = { ...minor_requirements, ...major_requirements };
        const reqCount = Object.keys(requirements).length;
        setMajorPlanSearchTabData({
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
            setMajorPlanSearchTabData({
              progress: 20 + Math.round(progressVal * 0.7),
              ...(statusMessage ? { progressLabel: statusMessage } : {}),
            });
          },
        );

        if (!data) {
          AppLogger.error("No data returned from fetchCourseSearchData");
          setMajorPlanSearchTabData(
            "progressLabel",
            `Error: No course data found for ${major} - ${subplan}`,
          );
          return;
        }

        AppLogger.info("Data returned from API:", data);
        setMajorPlanSearchTabData({
          progress: 90,
          progressLabel: "Processing course sections",
        });

        for (const [courseKey, course] of Object.entries(data)) {
          newOpenCourses[courseKey] = course;
        }

        setMajorPlanSearchTabData({
          progress: 95,
          progressLabel: "Finalizing search results",
        });
        AppLogger.info("Setting openCourses with:", newOpenCourses);
        setMajorPlanSearchTabData({
          isLoaded: true,
          openCourses: newOpenCourses,
        });
        AppLogger.info("Updated open courses:", newOpenCourses);
      } catch (error) {
        AppLogger.error("Error in fetchOpenCourses:", error);
        setMajorPlanSearchTabData(
          "progressLabel",
          `Error fetching courses: ${error}`,
        );
      } finally {
        setMajorPlanSearchTabData({
          progress: 100,
          progressLabel: "Complete",
        });
      }
    }
  };

  const requirements = useMemo(() => {
    if (
      !(
        (majorPlanSearchData.selectedMajor &&
          majorPlanSearchData.selectedSubplan) ||
        majorPlanSearchData.selectedMinor
      ) ||
      !majorPlanSearchData.selectedTerm
    ) {
      return {} as Record<string, { courses: readonly RequiredCourse[] }>;
    }

    const major_data = majorPlans[
      majorPlanSearchData.selectedMajor as keyof typeof majorPlans
    ] as MajorPlan;
    const subplan_data = major_data?.subplans[
      majorPlanSearchData.selectedSubplan as keyof typeof major_data.subplans
    ] as Subplan | undefined;
    const minor_data = minorPlans[
      majorPlanSearchData.selectedMinor as keyof typeof minorPlans
    ] as MinorPlan | undefined;
    const major_requirements = subplan_data?.requirements ?? {};
    const minor_requirements = minor_data?.requirements ?? {};

    return {
      ...minor_requirements,
      ...major_requirements,
    } as Record<string, { courses: readonly RequiredCourse[] }>;
  }, [
    majorPlanSearchData.selectedMajor,
    majorPlanSearchData.selectedSubplan,
    majorPlanSearchData.selectedMinor,
    majorPlanSearchData.selectedTerm,
  ]);

  const requirementEntries = useMemo(
    () =>
      Object.entries(requirements)
        .map(([requirementKey, requirement]) => ({
          requirementKey,
          courses: requirement.courses.filter((course: RequiredCourse) => {
            if (!majorPlanSearchData.hideNoSections) {
              return true;
            }
            const courseData = (
              majorPlanSearchData.openCourses as Record<
                string,
                MergedCourseData
              >
            )?.[`${course.course_abr} ${course.catalog_num}`];
            return (
              !!courseData?.sections &&
              Object.keys(courseData.sections).length > 0
            );
          }),
        }))
        .filter(({ courses }) => courses.length > 0),
    [
      requirements,
      majorPlanSearchData.hideNoSections,
      majorPlanSearchData.openCourses,
    ],
  );
  const hasMajorPlanSearchRun = Boolean(
    majorPlanSearchData.isLoaded &&
      (majorPlanSearchData.searchMajor || majorPlanSearchData.searchMinor),
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
                  key={`${requirementKey}-${course.course_abr} ${course.catalog_num}-${index}`}
                  className="mb-3"
                >
                  <h6 className="mb-2 border-b border-border pb-1 text-base font-medium text-foreground">
                    {course.course_descrip} ({course.course_abr}{" "}
                    {parseInt(course.catalog_num)})
                  </h6>

                  <div className="mb-2 w-full">
                    <CourseDisplay
                      course={course}
                      openCourses={majorPlanSearchData.openCourses}
                      onPreviewSectionChange={onPreviewSectionChange}
                      selectedPreviewId={selectedPreviewId}
                      scheduleBackground={scheduleBackground}
                      instructorFilter={majorPlanSearchData.instructorFilter}
                      scheduleFitOnly={majorPlanSearchData.scheduleFitOnly}
                      compactSections={majorPlanSearchData.compactSections}
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
    majorPlanSearchData.instructorFilter,
    majorPlanSearchData.openCourses,
    majorPlanSearchData.compactSections,
    majorPlanSearchData.scheduleFitOnly,
    requirementEntries,
    requirementListKey,
    scheduleBackground,
    selectedPreviewId,
  ]);

  const controlsPanel = (
    <PlannerPanel
      eyebrow="Major Plan Search"
      title="Parameters"
      description="Open requirement groups, compare live sections, and keep schedule context visible while you browse."
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="term_selector">Term</FieldLabel>
          <PlannerFilterCombobox
            items={Object.keys(TermIdByName)}
            value={majorPlanSearchData.selectedTerm}
            onValueChange={handleTermChange}
            placeholder="Select term"
            emptyLabel="No terms found."
            portalContainer={portalContainer}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="major_selector">Major</FieldLabel>
          <PlannerFilterCombobox
            items={major_options}
            value={majorPlanSearchData.selectedMajor}
            onValueChange={handleMajorChange}
            placeholder="Select major"
            emptyLabel="No majors found."
            portalContainer={portalContainer}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="minor_selector">Minor</FieldLabel>
          <PlannerFilterCombobox
            items={minor_options}
            value={majorPlanSearchData.selectedMinor}
            onValueChange={handleMinorChange}
            placeholder="Select minor"
            emptyLabel="No minors found."
            portalContainer={portalContainer}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="subplan_selector">Subplan</FieldLabel>
          <PlannerFilterCombobox
            items={subplanOptions}
            value={majorPlanSearchData.selectedSubplan}
            onValueChange={handleSubplanChange}
            placeholder="Select subplan"
            emptyLabel="No subplans found."
            disabled={!majorPlanSearchData.selectedMajor}
            portalContainer={portalContainer}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="plan_instructor_filter">Instructor</FieldLabel>
          <PlannerFilterCombobox
            items={planInstructorOptions}
            value={majorPlanSearchData.instructorFilter}
            onValueChange={(value) =>
              setMajorPlanSearchTabData("instructorFilter", value)
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
        <ScheduleFitField
          id="plan-schedule-fit"
          checked={majorPlanSearchData.scheduleFitOnly}
          onCheckedChange={(checked) =>
            setMajorPlanSearchTabData("scheduleFitOnly", checked)
          }
        />
        <SearchSubmitButton
          onClick={runMajorPlanSearch}
          disabled={isSearchDisabled}
        />
        <HideEmptySectionsField
          id="hide-empty-plan"
          checked={majorPlanSearchData.hideNoSections ?? false}
          onCheckedChange={(checked) =>
            setMajorPlanSearchTabData("hideNoSections", checked)
          }
        />
      </FieldGroup>
      {!majorPlanSearchData.isLoaded ? (
        <div className="mt-4 flex w-full justify-center">
          <CircularProgressWithLabel
            value={majorPlanSearchData.progress}
            label={majorPlanSearchData.progressLabel || ""}
          />
        </div>
      ) : null}
    </PlannerPanel>
  );

  const resultsPanel = (
    <PlannerPanel
      eyebrow="Comparison Workspace"
      title="Requirement Tree"
      actions={
        <SectionDensityToggle
          value={majorPlanSearchData.compactSections ? "compact" : "comfy"}
          onValueChange={(value) =>
            setMajorPlanSearchTabData("compactSections", value === "compact")
          }
        />
      }
    >
      {hasMajorPlanSearchRun && requirementsList ? (
        requirementsList
      ) : (
        <p className="p-3 text-center text-muted-foreground">
          No search results found for the selected plan and filters.
        </p>
      )}
    </PlannerPanel>
  );

  return (
    <PlannerWorkbenchLayout
      controls={controlsPanel}
      results={resultsPanel}
      preview={previewContent}
    />
  );
}
