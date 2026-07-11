import { ChevronRightIcon, ChevronDownIcon } from "lucide-react";
import React, { useMemo, useCallback, useState } from "react";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import type { RequiredCourse } from "../../../degree-planning/types/Plans";
import { GEP_COURSES } from "../../../generated/catalogs/gep-search/gepCourses.typed";
import { SubjectMenuValues } from "../../../generated/catalogs/subjectSearchValues";
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
import { fetchGEPCourseData } from "../../services/api/planner-search/dataService";
import type { ScheduleEvent } from "../../types/calendar";
import type { MergedCourseData } from "../../types/section";
import { type GepSearchData, type TabUpdater } from "../tab-state/tabState";

import { CourseSectionsCardList } from "./CourseSectionsCardList";

/* eslint-disable react/prop-types -- TypeScript props on memo inner components */

interface AutocompletesProps {
  selectedTerm: string | null;
  searchSubject: string | null;
  onTermChange: (value: string | null) => void;
  onSubjectChange: (value: string | null) => void;
  portalContainer: HTMLElement | null;
}

const TERM_OPTIONS = Object.keys(TermIdByName);

type GepSubjectCode = keyof typeof GEP_COURSES;

const GEP_SUBJECTS: { code: GepSubjectCode; label: string }[] = [
  { code: "FAD", label: "Foundations of American Democracy" },
  { code: "GLOBAL", label: "Global Knowledge" },
  { code: "HES", label: "Health and Exercise Studies" },
  { code: "HUM", label: "Humanities" },
  { code: "INTERDISC", label: "Interdisciplinary Perspectives" },
  { code: "MATH", label: "Mathematical Sciences" },
  { code: "NATSCI", label: "Natural Sciences" },
  { code: "SOCSCI", label: "Social Sciences" },
  { code: "USDIV", label: "U.S. Diversity" },
  { code: "USDEI", label: "U.S. Diversity, Equity, and Inclusion" },
  { code: "VPA", label: "Visual and Performing Arts" },
];

const SUBJECT_OPTIONS = GEP_SUBJECTS.map((subject) => subject.label);

function findGepSubject(value: string | null) {
  if (!value) {
    return null;
  }
  return (
    GEP_SUBJECTS.find(
      (subject) => subject.code === value || subject.label === value,
    ) ?? null
  );
}

const MemoizedAutocompletes: React.FC<AutocompletesProps> = React.memo(
  ({
    selectedTerm,
    searchSubject,
    onTermChange,
    onSubjectChange,
    portalContainer,
  }) => {
    return (
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="term_selector">Term</FieldLabel>
          <PlannerFilterCombobox
            items={TERM_OPTIONS}
            value={selectedTerm}
            onValueChange={onTermChange}
            placeholder="Select term"
            emptyLabel="No terms found."
            portalContainer={portalContainer}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="subject_selector">GEP Subject</FieldLabel>
          <PlannerFilterCombobox
            items={SUBJECT_OPTIONS}
            value={findGepSubject(searchSubject)?.label ?? searchSubject}
            onValueChange={onSubjectChange}
            placeholder="Select GEP subject"
            emptyLabel="No GEP subjects found."
            portalContainer={portalContainer}
          />
          <FieldDescription>
            Choose a GEP bucket to load matching courses and sections.
          </FieldDescription>
        </Field>
      </FieldGroup>
    );
  },
);

export interface GroupedCourse {
  displayTitle: string;
  courses: RequiredCourse[];
  courseAbr: string;
}

interface GEPTreeProps {
  groupedData: GroupedCourse[];
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (courseAbr: string) => void;
  courseData: Record<string, MergedCourseData> | {};
  onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
  selectedPreviewId: string | null;
  scheduleBackground: ScheduleEvent[];
  instructorFilter: string | null;
  scheduleFitOnly: boolean;
  compactSections: boolean;
}

const CourseSections = React.memo(
  ({
    courseDataEntry,
    courseKeyPrefix,
    onPreviewSectionChange,
    selectedPreviewId,
    scheduleBackground,
    instructorFilter,
    scheduleFitOnly,
    compactSections,
  }: {
    courseDataEntry: MergedCourseData | undefined;
    courseKeyPrefix: string;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    selectedPreviewId: string | null;
    scheduleBackground: ScheduleEvent[];
    instructorFilter: string | null;
    scheduleFitOnly: boolean;
    compactSections: boolean;
  }) => {
    const sections = useMemo(() => {
      if (courseDataEntry?.sections) {
        return Object.values(courseDataEntry.sections);
      }
      return [];
    }, [courseDataEntry?.sections]);

    if (sections.length > 0) {
      return (
        <div className="flex h-auto w-full">
          <CourseSectionsCardList
            tab="gep_search"
            sections={sections}
            rowKeyPrefix={courseKeyPrefix}
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
      <p className="p-2 text-sm italic text-muted-foreground">
        No sections available
      </p>
    );
  },
);

const GEPTree: React.FC<GEPTreeProps> = React.memo(
  ({
    groupedData,
    expandedGroups,
    onToggleGroup,
    courseData,
    onPreviewSectionChange,
    selectedPreviewId,
    scheduleBackground,
    instructorFilter,
    scheduleFitOnly,
    compactSections,
  }) => {
    return (
      <div className="w-full">
        {groupedData.map((group) => (
          <React.Fragment key={`group-fragment-${group.courseAbr}`}>
            <button
              type="button"
              key={`group-${group.courseAbr}`}
              className="flex cursor-pointer items-center justify-between border-b border-border px-2 py-[1.25] hover:bg-foreground/[0.06]"
              onClick={() => onToggleGroup(group.courseAbr)}
            >
              <h6 className="text-base font-semibold">
                {group.displayTitle} ({group.courses.length})
              </h6>
              {expandedGroups[group.courseAbr] ? (
                <ChevronDownIcon className="size-4 text-primary" />
              ) : (
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              )}
            </button>
            {expandedGroups[group.courseAbr] &&
              group.courses.map((course) => {
                const courseKey = `${course.course_abr} ${course.catalog_num}`;
                const courseDataEntry = (
                  courseData as Record<string, MergedCourseData>
                )[courseKey];
                return (
                  <div
                    key={`course-${courseKey}`}
                    className="flex min-h-0 flex-col items-stretch border-b border-border py-2 pl-5"
                  >
                    <div className="flex w-full flex-col">
                      <div className="mb-2 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {`${course.course_descrip} (${course.course_abr} ${parseInt(course.catalog_num, 10)})`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {courseKey}
                        </p>
                      </div>
                      <CourseSections
                        courseDataEntry={courseDataEntry}
                        courseKeyPrefix={`${courseKey}-`}
                        onPreviewSectionChange={onPreviewSectionChange}
                        selectedPreviewId={selectedPreviewId}
                        scheduleBackground={scheduleBackground}
                        instructorFilter={instructorFilter}
                        scheduleFitOnly={scheduleFitOnly}
                        compactSections={compactSections}
                      />
                    </div>
                  </div>
                );
              })}
          </React.Fragment>
        ))}
      </div>
    );
  },
);

/**
 * GEP Search tab for querying General Education Program courses by subject and term
 * and displaying available sections grouped by subject code.
 *
 * @param props Tab state setter and current state
 * @returns {JSX.Element} GEP Search tab UI
 */
export default function GepSearch({
  setGepSearchTabData,
  GepSearchData,
  onPreviewSectionChange,
  previewContent,
  selectedPreviewId,
}: {
  setGepSearchTabData: TabUpdater<GepSearchData>;
  GepSearchData: GepSearchData;
  onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
  previewContent: React.ReactNode;
  selectedPreviewId: string | null;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const {
    selectedTerm,
    searchSubject,
    isLoaded,
    courses,
    courseData,
    hideNoSections,
    progress,
    progressLabel,
    instructorFilter,
    scheduleFitOnly,
    compactSections,
  } = GepSearchData;
  const selectedSubject = findGepSubject(searchSubject);
  const selectedSubjectCode = selectedSubject?.code ?? null;
  const selectedSubjectLabel = selectedSubject?.label ?? searchSubject;
  const isSearchDisabled = !selectedTerm || !selectedSubjectCode;
  const portalContainer = useOverlayPortalContainer();
  const scheduleBackground = useScheduleBackgroundEvents();

  const gepInstructorOptions = useMemo(() => {
    const names = new Set<string>();
    const data = courseData as Record<string, MergedCourseData>;
    for (const c of Object.values(data)) {
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
  }, [courseData]);

  const courseSearch = useCallback(async () => {
    setExpandedGroups({});
    onPreviewSectionChange(null);
    setGepSearchTabData({
      progress: 10,
      progressLabel: "Initializing GEP course search...",
      isLoaded: false,
      courses: [],
      courseData: {},
    });
    AppLogger.info("Course search clicked with:", {
      selectedTerm,
      searchSubject: selectedSubjectLabel,
      searchSubjectCode: selectedSubjectCode,
    });

    try {
      if (selectedSubjectCode && selectedTerm) {
        const courseInfo = GEP_COURSES[selectedSubjectCode];
        if (courseInfo) {
          const coursesResult = Object.entries(courseInfo).map(
            ([course_title, course_info_val]) => {
              const title = course_title as string;
              const course_entry = course_info_val as {
                course_title: string;
                course_id: string;
              };
              return {
                course_id: course_entry.course_id,
                course_abr: title.split("-")[0].trim(),
                catalog_num: title.split("-")[1].trim(),
                course_descrip: course_entry.course_title,
                term: selectedTerm,
              } as RequiredCourse;
            },
          );

          setGepSearchTabData({
            courses: coursesResult,
            progressLabel: `Processing ${coursesResult.length} GEP courses for ${selectedSubjectLabel ?? selectedSubjectCode}`,
          });

          const courseDataResult = await fetchGEPCourseData(
            coursesResult,
            selectedTerm,
            (progressValue, statusMessage) => {
              setGepSearchTabData({
                progress: progressValue,
                ...(statusMessage ? { progressLabel: statusMessage } : {}),
              });
            },
          );

          setGepSearchTabData("courseData", courseDataResult || {});
        }
      }
    } catch (error) {
      AppLogger.error("Error fetching course data:", error);
      setGepSearchTabData("progressLabel", "Error fetching GEP course data");
    } finally {
      setGepSearchTabData({
        progress: 100,
        progressLabel: "Complete",
        isLoaded: true,
      });
    }
  }, [
    onPreviewSectionChange,
    selectedSubjectCode,
    selectedSubjectLabel,
    selectedTerm,
    setGepSearchTabData,
  ]);

  const filteredCourses = useMemo(() => {
    if (!isLoaded || !courses || courses.length === 0) return [];
    if (!hideNoSections || !courseData) return courses;
    return courses.filter((course: RequiredCourse) => {
      const key = `${course.course_abr} ${course.catalog_num}`;
      const courseDataEntry = (courseData as Record<string, MergedCourseData>)[
        key
      ];
      return (
        courseDataEntry &&
        courseDataEntry.sections &&
        Object.keys(courseDataEntry.sections).length > 0
      );
    });
  }, [courses, hideNoSections, courseData, isLoaded]);

  const groupedAndFilteredCourses = useMemo(() => {
    if (!filteredCourses || filteredCourses.length === 0) return [];

    const groups: Record<string, GroupedCourse> = {};

    filteredCourses.forEach((course) => {
      const abr = course.course_abr;
      if (!groups[abr]) {
        groups[abr] = {
          courseAbr: abr,
          displayTitle: SubjectMenuValues[abr] || `${abr} - Unknown Subject`,
          courses: [],
        };
      }
      groups[abr].courses.push(course);
    });
    return Object.values(groups).sort((a, b) =>
      a.displayTitle.localeCompare(b.displayTitle),
    );
  }, [filteredCourses]);

  const handleToggleGroup = useCallback((courseAbr: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [courseAbr]: !prev[courseAbr],
    }));
  }, []);

  const handleHideNoSectionsChange = useCallback(
    (checked: boolean) => {
      setGepSearchTabData("hideNoSections", checked);
    },
    [setGepSearchTabData],
  );

  const handleTermChange = useCallback(
    (value: string | null) => {
      setGepSearchTabData({
        selectedTerm: value,
        instructorFilter: null,
      });
      setExpandedGroups({});
      onPreviewSectionChange(null);
    },
    [onPreviewSectionChange, setGepSearchTabData],
  );

  const handleSubjectChange = useCallback(
    (value: string | null) => {
      setGepSearchTabData({
        searchSubject: value,
        instructorFilter: null,
      });
      setExpandedGroups({});
      onPreviewSectionChange(null);
    },
    [onPreviewSectionChange, setGepSearchTabData],
  );

  const controlsPanel = (
    <PlannerPanel
      eyebrow="GEP Search"
      title="Parameters"
      description="Browse matching requirement buckets and keep a section preview pinned while you compare."
    >
      <MemoizedAutocompletes
        selectedTerm={selectedTerm}
        searchSubject={searchSubject}
        onTermChange={handleTermChange}
        onSubjectChange={handleSubjectChange}
        portalContainer={portalContainer}
      />
      <FieldGroup className="mt-4">
        <Field>
          <FieldLabel htmlFor="gep_instructor_filter">Instructor</FieldLabel>
          <PlannerFilterCombobox
            items={gepInstructorOptions}
            value={instructorFilter}
            onValueChange={(value) =>
              setGepSearchTabData("instructorFilter", value)
            }
            placeholder="Any instructor"
            emptyLabel="Run search to load instructors."
            disabled={gepInstructorOptions.length === 0}
            portalContainer={portalContainer}
          />
          <FieldDescription>
            Optional: limit section lists to one instructor.
          </FieldDescription>
        </Field>
        <ScheduleFitField
          id="gep-schedule-fit"
          checked={scheduleFitOnly}
          onCheckedChange={(checked) =>
            setGepSearchTabData("scheduleFitOnly", checked)
          }
        />
      </FieldGroup>
      <div className="mt-4 flex flex-col gap-3">
        <SearchSubmitButton
          onClick={courseSearch}
          disabled={isSearchDisabled}
        />
        <HideEmptySectionsField
          id="hide-empty-gep"
          checked={hideNoSections}
          onCheckedChange={handleHideNoSectionsChange}
        />
      </div>
      {!isLoaded ? (
        <div className="mt-4 flex w-full justify-center">
          <CircularProgressWithLabel
            value={progress}
            label={progressLabel || ""}
          />
        </div>
      ) : null}
    </PlannerPanel>
  );

  const resultsPanel = (
    <PlannerPanel
      eyebrow="Comparison Workspace"
      title="Requirement Matches"
      actions={
        <SectionDensityToggle
          value={compactSections ? "compact" : "comfy"}
          onValueChange={(value) =>
            setGepSearchTabData("compactSections", value === "compact")
          }
        />
      }
    >
      {isLoaded && groupedAndFilteredCourses.length > 0 ? (
        <GEPTree
          groupedData={groupedAndFilteredCourses}
          expandedGroups={expandedGroups}
          onToggleGroup={handleToggleGroup}
          courseData={courseData}
          onPreviewSectionChange={onPreviewSectionChange}
          selectedPreviewId={selectedPreviewId}
          scheduleBackground={scheduleBackground}
          instructorFilter={instructorFilter}
          scheduleFitOnly={scheduleFitOnly}
          compactSections={compactSections}
        />
      ) : (
        <p className="p-4 text-center text-base text-muted-foreground">
          No GEP courses found matching your criteria.{" "}
          {hideNoSections &&
            "Try unchecking 'Hide courses with no open sections'."}
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
