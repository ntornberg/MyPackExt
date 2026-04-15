import { ChevronRightIcon, ChevronDownIcon } from "lucide-react";

import React, { useMemo, useCallback, useState } from "react";

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
import { GEP_COURSES } from "../../../degree-planning/DialogAutoCompleteKeys/GEPSearch/gep_courses.typed.ts";
import { SubjectMenuValues } from "../../../degree-planning/DialogAutoCompleteKeys/SubjectSearchValues";
import { TermIdByName } from "../../../degree-planning/DialogAutoCompleteKeys/TermID.ts";
import type { RequiredCourse } from "../../../degree-planning/types/Plans";
import { CircularProgressWithLabel } from "../../../ui-system/components/shared/CircularProgressWithLabel";
import { PlannerFilterCombobox } from "../../../ui-system/components/workbench/PlannerFilterCombobox";
import { PlannerWorkbenchLayout } from "../../../ui-system/components/workbench/PlannerWorkbenchLayout";
import { formatSectionInstructors } from "../../../ui-system/components/workbench/sectionCompareUtils";
import { useOverlayPortalContainer } from "../../../ui-system/components/workbench/useOverlayPortalContainer";
import { useScheduleBackgroundEvents } from "../../../ui-system/components/workbench/useScheduleBackgroundEvents";
import { type PlannerSectionPreview } from "../../../ui-system/components/workbench/workbenchTypes";
import { AppLogger } from "../../../utils/logger.ts";
import { fetchGEPCourseData } from "../../services/api/DialogMenuSearch/dataService";
import type { ScheduleEvent } from "../../types/Calendar";
import type { MergedCourseData } from "../../types/Section";
import { type GEPData, type TabUpdater } from "../TabDataStore/TabData";

import { CourseSectionsCardList } from "./CourseSectionsCardList";

/* eslint-disable react/prop-types -- TypeScript props on memo inner components */

interface AutocompletesProps {
  selectedTerm: string | null;
  searchSubject: string | null;
  setGepSearchTabData: TabUpdater<GEPData>;
  portalContainer: HTMLElement | null;
}

const TERM_OPTIONS = Object.keys(TermIdByName);

const SUBJECT_OPTIONS = Object.keys(GEP_COURSES);

const MemoizedAutocompletes: React.FC<AutocompletesProps> = React.memo(
  ({ selectedTerm, searchSubject, setGepSearchTabData, portalContainer }) => {
    return (
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="term_selector">Term</FieldLabel>
          <PlannerFilterCombobox
            items={TERM_OPTIONS}
            value={selectedTerm}
            onValueChange={(value) =>
              setGepSearchTabData("selectedTerm", value)
            }
            placeholder="Select term"
            emptyLabel="No terms found."
            portalContainer={portalContainer}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="subject_selector">GEP Subject</FieldLabel>
          <PlannerFilterCombobox
            items={SUBJECT_OPTIONS}
            value={searchSubject}
            onValueChange={(value) =>
              setGepSearchTabData("searchSubject", value)
            }
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
  }: {
    courseDataEntry: MergedCourseData | undefined;
    courseKeyPrefix: string;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    selectedPreviewId: string | null;
    scheduleBackground: ScheduleEvent[];
    instructorFilter: string | null;
    scheduleFitOnly: boolean;
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
  }) => {
    return (
      <div className="w-full">
        {groupedData.map((group) => (
          <React.Fragment key={`group-fragment-${group.courseAbr}`}>
            <div
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
            </div>
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
                        <p className="text-xs text-muted-foreground">{courseKey}</p>
                      </div>
                      <CourseSections
                        courseDataEntry={courseDataEntry}
                        courseKeyPrefix={`${courseKey}-`}
                        onPreviewSectionChange={onPreviewSectionChange}
                        selectedPreviewId={selectedPreviewId}
                        scheduleBackground={scheduleBackground}
                        instructorFilter={instructorFilter}
                        scheduleFitOnly={scheduleFitOnly}
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
export default function GEPSearch({
  setGepSearchTabData,
  gepSearchData,
  onPreviewSectionChange,
  previewContent,
  selectedPreviewId,
}: {
  setGepSearchTabData: TabUpdater<GEPData>;
  gepSearchData: GEPData;
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
  } = gepSearchData;
  const isSearchDisabled = !selectedTerm || !searchSubject;
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
    void logEvent("gep_search_clicked", {
      tab: "gep_search",
      term: selectedTerm ?? "unknown",
      subject: searchSubject ?? "unknown",
    });
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
      searchSubject,
    });

    try {
      if (searchSubject && selectedTerm) {
        const courseInfo =
          GEP_COURSES[searchSubject as keyof typeof GEP_COURSES];
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
            progressLabel: `Processing ${coursesResult.length} GEP courses for ${searchSubject}`,
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
    searchSubject,
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

  const controlsPanel = (
    <Card className="overflow-visible bg-card/80 shadow-sm">
      <CardHeader className="gap-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-primary/75">
          GEP Search
        </div>
        <CardTitle className="text-base">Parameters</CardTitle>
        <CardDescription>
          Browse matching requirement buckets and keep a section preview pinned
          while you compare.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MemoizedAutocompletes
          selectedTerm={selectedTerm}
          searchSubject={searchSubject}
          setGepSearchTabData={setGepSearchTabData}
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
          <Field>
            <div className="flex items-start gap-3 rounded-lg border-2 border-border bg-card p-3.5 shadow-sm dark:bg-card/95">
              <Checkbox
                id="gep-schedule-fit"
                checked={scheduleFitOnly}
                onCheckedChange={(v) =>
                  setGepSearchTabData("scheduleFitOnly", v === true)
                }
                aria-describedby="gep-schedule-fit-desc"
                className="mt-0.5 size-5 rounded-md border-2 border-foreground/40 bg-background shadow-sm dark:border-foreground/50 dark:bg-muted/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              />
              <div className="min-w-0 space-y-1">
                <FieldLabel
                  htmlFor="gep-schedule-fit"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  Fits my schedule
                </FieldLabel>
                <FieldDescription id="gep-schedule-fit-desc">
                  Hide sections that overlap classes in your cart or enrolled
                  schedule.
                </FieldDescription>
              </div>
            </div>
          </Field>
        </FieldGroup>
        <div className="mt-4 flex flex-col gap-3">
          <Button
            onClick={courseSearch}
            disabled={isSearchDisabled}
            className="w-full font-semibold"
          >
            Search
          </Button>
          <Field orientation="horizontal">
            <ShadcnCheckbox
              checked={hideNoSections}
              onCheckedChange={(checked) =>
                handleHideNoSectionsChange(Boolean(checked))
              }
              id="hide-empty-gep"
            />
            <FieldLabel htmlFor="hide-empty-gep" className="font-normal">
              Hide courses with no open sections
            </FieldLabel>
          </Field>
        </div>
        {!isLoaded ? (
          <div className="mt-4 flex justify-center">
            <CircularProgressWithLabel
              value={progress}
              label={progressLabel || ""}
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
        <CardTitle className="text-base">Requirement Matches</CardTitle>
      </CardHeader>
      <CardContent>
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
          />
        ) : (
          <p className="p-4 text-center text-base text-muted-foreground">
            No GEP courses found matching your criteria.{" "}
            {hideNoSections &&
              "Try unchecking 'Hide courses with no open sections'."}
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
