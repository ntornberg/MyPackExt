import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

import { logEvent } from "../../../analytics/ga4";
import { DEPT_COURSES } from "../../../degree-planning/DialogAutoCompleteKeys/CourseSearch/department_courses.typed";
import { TermIdByName } from "../../../degree-planning/DialogAutoCompleteKeys/TermID.ts";
import { CircularProgressWithLabel } from "../../../ui-system/components/shared/CircularProgressWithLabel.tsx";
import { PlannerFilterCombobox } from "../../../ui-system/components/workbench/PlannerFilterCombobox";
import { PlannerWorkbenchLayout } from "../../../ui-system/components/workbench/PlannerWorkbenchLayout";
import { SectionCompareCard } from "../../../ui-system/components/workbench/SectionCompareCard";
import { SectionCompareList } from "../../../ui-system/components/workbench/SectionCompareList";
import {
  defaultLabClassForGroup,
  formatSectionInstructors,
  groupedSectionForPreview,
  previewIdForGroupedRow,
  sectionMatchesInstructorFilter,
} from "../../../ui-system/components/workbench/sectionCompareUtils";
import { useOverlayPortalContainer } from "../../../ui-system/components/workbench/useOverlayPortalContainer";
import { useScheduleBackgroundEvents } from "../../../ui-system/components/workbench/useScheduleBackgroundEvents";
import {
  createSectionPreview,
  type PlannerSectionPreview,
} from "../../../ui-system/components/workbench/workbenchTypes";
import { AppLogger } from "../../../utils/logger";
import { fetchSingleCourseData } from "../../services/api/DialogMenuSearch/dataService";
import { sortSections } from "../../types/DataGridCourse";
import type {
  GroupedSections,
  ModifiedSection,
  MergedCourseData,
} from "../../types/Section";
import { modifiedSectionToScheduleEvents } from "../../utils/modifiedSectionToScheduleEvents";
import { sectionFitsSchedule } from "../../utils/scheduleFitFilter";
import { ToCartGroupedSectionCell } from "../DataGridCells/ToCartButtonCell";
import type { CourseSearchData, TabUpdater } from "../TabDataStore/TabData";

interface DeptCourse {
  course_id: string;
  course_title: string;
}

type GroupedRow = GroupedSections & { uniqueRowId: string };

const COURSE_SECTIONS_CACHE_PREFIX = "mypack-course-sections-v1:";

function courseSectionsCacheKey(
  term: string | null,
  subject: string | null,
  courseId: string | null | undefined,
): string | null {
  if (!term || !subject || !courseId) {
    return null;
  }
  return `${COURSE_SECTIONS_CACHE_PREFIX}${term}\u001f${subject}\u001f${courseId}`;
}

/**
 * Course Search tab allowing users to select term, subject, and course, then fetch sections.
 *
 * @param props Tab state setter and current state
 * @returns {JSX.Element} Course Search tab UI
 */
export default function CourseSearch({
  setCourseSearchTabData,
  courseSearchData,
  onPreviewSectionChange,
  previewContent,
  selectedPreviewId,
}: {
  setCourseSearchTabData: TabUpdater<CourseSearchData>;
  courseSearchData: CourseSearchData;
  onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
  previewContent: React.ReactNode;
  selectedPreviewId: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [courseData, setCourseData] = useState<MergedCourseData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [labClassByRowId, setLabClassByRowId] = useState<
    Record<string, string>
  >({});
  const skipResultsCacheRestoreRef = useRef(false);
  const portalContainer = useOverlayPortalContainer();
  const scheduleBackground = useScheduleBackgroundEvents();

  const resultsCacheKey = useMemo(
    () =>
      courseSectionsCacheKey(
        courseSearchData.selectedTerm,
        courseSearchData.searchSubject,
        courseSearchData.selectedCourseInfo?.id,
      ),
    [
      courseSearchData.selectedTerm,
      courseSearchData.searchSubject,
      courseSearchData.selectedCourseInfo?.id,
    ],
  );

  useEffect(() => {
    if (skipResultsCacheRestoreRef.current) {
      return;
    }
    if (!resultsCacheKey) {
      setCourseData(null);
      setHasSearched(false);
      return;
    }
    try {
      const raw = sessionStorage.getItem(resultsCacheKey);
      if (!raw) {
        setCourseData(null);
        setHasSearched(false);
        return;
      }
      setCourseData(JSON.parse(raw) as MergedCourseData);
      setHasSearched(true);
    } catch {
      setCourseData(null);
      setHasSearched(false);
    }
  }, [resultsCacheKey]);

  const search = useCallback(
    async (
      subject: string | null,
      course: string | null,
      courseId: string,
      term: string | null,
    ) => {
      if (!subject || !course || !term) {
        return null;
      }

      setCourseData(null);
      setIsLoading(true);
      setProgress(10);
      setProgressLabel("Initializing search...");
      setError(null);

      try {
        setProgress(20);
        setProgressLabel(`Searching for ${course} in ${term}`);

        const result = await fetchSingleCourseData(
          subject,
          course,
          courseId,
          term,
          (progressValue, statusMessage) => {
            setProgress(20 + Math.round(progressValue * 0.75));
            if (statusMessage) {
              setProgressLabel(statusMessage);
            }
          },
        );

        if (result) {
          setCourseData(result);
          const cacheKey = courseSectionsCacheKey(term, subject, courseId);
          if (cacheKey) {
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify(result));
            } catch {
              /* quota */
            }
          }
        }
        return result;
      } catch (err) {
        const e =
          err instanceof Error ? err : new Error("Unknown error occurred");
        setError(e);
        return null;
      } finally {
        setProgress(100);
        setProgressLabel("Complete");
        setIsLoading(false);
      }
    },
    [],
  );

  const courseSearch = async () => {
    void logEvent("course_search_clicked", {
      tab: "course_search",
      term: courseSearchData.selectedTerm ?? "unknown",
      subject: courseSearchData.searchSubject ?? "unknown",
      catalog_num: courseSearchData.selectedCourseInfo?.catalogNum ?? "unknown",
    });
    AppLogger.info("Course search clicked with:", {
      selectedTerm: courseSearchData.selectedTerm,
      searchSubject: courseSearchData.searchSubject,
      selectedCourseInfo: courseSearchData.selectedCourseInfo,
    });

    if (
      courseSearchData.searchSubject &&
      courseSearchData.selectedCourseInfo &&
      courseSearchData.selectedTerm
    ) {
      skipResultsCacheRestoreRef.current = true;
      setHasSearched(true);
      setLabClassByRowId({});
      onPreviewSectionChange(null);
      try {
        await search(
          courseSearchData.searchSubject,
          courseSearchData.selectedCourseInfo.catalogNum,
          courseSearchData.selectedCourseInfo.id,
          courseSearchData.selectedTerm,
        );
      } finally {
        skipResultsCacheRestoreRef.current = false;
      }
    }
  };

  useEffect(() => {
    if (!courseSearchData.searchSubject) {
      setCourseSearchTabData("searchCourse", null);
      setCourseSearchTabData("selectedCourseInfo", null);
      onPreviewSectionChange(null);
    }
  }, [
    courseSearchData.searchSubject,
    onPreviewSectionChange,
    setCourseSearchTabData,
  ]);

  const handleCourseChange = (value: string | null) => {
    setCourseSearchTabData("searchCourse", value);

    if (value && courseSearchData.searchSubject) {
      AppLogger.info("Course change detected:", {
        value,
        searchSubject: courseSearchData.searchSubject,
      });
      const courseCode = value.split(" ")[0];

      if (courseSearchData.searchSubject in DEPT_COURSES) {
        const deptCourses =
          DEPT_COURSES[
            courseSearchData.searchSubject as keyof typeof DEPT_COURSES
          ];

        if (courseCode in deptCourses) {
          const courseInfo = deptCourses[
            courseCode as keyof typeof deptCourses
          ] as unknown as DeptCourse;

          const match = courseCode.match(/[0-9]+[A-Za-z]?$/);
          const catalogNum = match
            ? match[0]
            : courseCode.replace(courseSearchData.searchSubject, "");

          AppLogger.info(
            `Extracted catalog number ${catalogNum} from course code ${courseCode}`,
          );

          setCourseSearchTabData("selectedCourseInfo", {
            code: courseCode,
            catalogNum: catalogNum,
            title: courseInfo.course_title,
            id: courseInfo.course_id,
          });
          return;
        }
      }
      setCourseSearchTabData("selectedCourseInfo", null);
    } else {
      setCourseSearchTabData("selectedCourseInfo", null);
    }
  };

  const courseOptions = useMemo(() => {
    if (!courseSearchData.searchSubject) {
      return [];
    }
    return Object.entries(
      DEPT_COURSES[courseSearchData.searchSubject as keyof typeof DEPT_COURSES],
    ).map(
      ([code, details]) =>
        `${code} ${(details as unknown as DeptCourse).course_title}`,
    );
  }, [courseSearchData.searchSubject]);

  const tableRows = useMemo((): GroupedRow[] => {
    if (!courseData?.sections) {
      return [];
    }
    return Object.values(courseData.sections)
      .flatMap((section, index) => {
        if (section.lecture && section.labs && section.labs.length > 0) {
          return [
            {
              ...section,
              uniqueRowId: `grouped-${section.lecture.section || index}`,
            },
          ];
        }
        if (section.lecture && (!section.labs || section.labs.length === 0)) {
          return [
            {
              ...section,
              uniqueRowId: `lecture-only-${section.lecture.section || index}`,
            },
          ];
        }
        if (section.labs && section.labs.length > 0) {
          return section.labs.reduce((acc: GroupedRow[], lab, labIndex) => {
            acc.push({
              labs: null,
              lecture: lab,
              uniqueRowId: `lab-only-${lab.section || `${index}-${labIndex}`}`,
            });
            return acc;
          }, []);
        }
        return [];
      })
      .sort(sortSections);
  }, [courseData?.sections]);

  const instructorOptions = useMemo(() => {
    const names = new Set<string>();
    for (const row of tableRows) {
      const lec = row.lecture;
      if (!lec) {
        continue;
      }
      const s = formatSectionInstructors(lec).trim();
      if (s) {
        names.add(s);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [tableRows]);

  const filteredTableRows = useMemo(() => {
    return tableRows.filter((row) => {
      const lec = row.lecture;
      if (!lec) {
        return false;
      }
      if (
        !sectionMatchesInstructorFilter(lec, courseSearchData.instructorFilter)
      ) {
        return false;
      }
      if (courseSearchData.scheduleFitOnly) {
        const pick = labClassByRowId[row.uniqueRowId];
        const previewSec = groupedSectionForPreview(row, pick);
        if (!previewSec) {
          return false;
        }
        const evs = modifiedSectionToScheduleEvents(previewSec);
        if (!sectionFitsSchedule(evs, scheduleBackground)) {
          return false;
        }
      }
      return true;
    });
  }, [
    tableRows,
    courseSearchData.instructorFilter,
    courseSearchData.scheduleFitOnly,
    labClassByRowId,
    scheduleBackground,
  ]);

  const isSearchDisabled =
    !courseSearchData.selectedTerm ||
    !courseSearchData.searchSubject ||
    !courseSearchData.selectedCourseInfo?.catalogNum ||
    isLoading;
  const courseHelperText = !courseSearchData.searchSubject
    ? "Choose a subject to load course options."
    : courseSearchData.selectedCourseInfo?.catalogNum
      ? "Ready to search."
      : "Select a course to enable search.";
  const emptyStateMessage = error
    ? "Could not load results. Please try your search again."
    : hasSearched
      ? "No courses found for this search."
      : "Select a term, subject, and course above to search.";

  const handleRowPreview = useCallback(
    (group: GroupedRow, labClassOverride?: string | null) => {
      const lec = group.lecture;
      if (!lec) {
        return;
      }
      const pick =
        labClassOverride !== undefined
          ? labClassOverride
          : labClassByRowId[group.uniqueRowId];
      const section = groupedSectionForPreview(group, pick);
      if (!section) {
        return;
      }
      onPreviewSectionChange(createSectionPreview("course_search", section));
    },
    [labClassByRowId, onPreviewSectionChange],
  );

  const controlsPanel = (
    <Card className="overflow-visible bg-card/80 shadow-sm">
      <CardHeader className="gap-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-primary/75">
          Course Search
        </div>
        <CardTitle className="text-base">Parameters</CardTitle>
        <CardDescription>
          Pick a term, subject, and course to load section comparisons.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="term_selector">Term</FieldLabel>
            <PlannerFilterCombobox
              items={Object.keys(TermIdByName)}
              value={courseSearchData.selectedTerm}
              onValueChange={(value) =>
                setCourseSearchTabData("selectedTerm", value)
              }
              placeholder="Select term"
              emptyLabel="No terms found."
              portalContainer={portalContainer}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="subject_selector">Subject</FieldLabel>
            <PlannerFilterCombobox
              items={Object.keys(DEPT_COURSES)}
              value={courseSearchData.searchSubject}
              onValueChange={(value) =>
                setCourseSearchTabData("searchSubject", value)
              }
              placeholder="Select subject"
              emptyLabel="No subjects found."
              portalContainer={portalContainer}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="course_selector">Course</FieldLabel>
            <PlannerFilterCombobox
              items={courseOptions}
              value={courseSearchData.searchCourse}
              onValueChange={handleCourseChange}
              placeholder={
                courseSearchData.searchSubject
                  ? "Type course code or title"
                  : "Select subject first"
              }
              emptyLabel={
                courseSearchData.searchSubject
                  ? "No courses match this subject."
                  : "Select a subject first."
              }
              disabled={!courseSearchData.searchSubject}
              portalContainer={portalContainer}
            />
            <FieldDescription>{courseHelperText}</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="course_instructor_filter">
              Instructor
            </FieldLabel>
            <PlannerFilterCombobox
              items={instructorOptions}
              value={courseSearchData.instructorFilter}
              onValueChange={(value) =>
                setCourseSearchTabData("instructorFilter", value)
              }
              placeholder="Any instructor"
              emptyLabel="Run search to load instructors."
              disabled={instructorOptions.length === 0}
              portalContainer={portalContainer}
            />
            <FieldDescription>
              Optional: limit the section list to one instructor.
            </FieldDescription>
          </Field>

          <Field>
            <div className="flex items-start gap-3 rounded-lg border-2 border-border bg-card p-3.5 shadow-sm dark:bg-card/95">
              <Checkbox
                id="course-schedule-fit"
                checked={courseSearchData.scheduleFitOnly}
                onCheckedChange={(v) =>
                  setCourseSearchTabData("scheduleFitOnly", v === true)
                }
                aria-describedby="course-schedule-fit-desc"
                className="mt-0.5 size-5 rounded-md border-2 border-foreground/40 bg-background shadow-sm dark:border-foreground/50 dark:bg-muted/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              />
              <div className="min-w-0 space-y-1">
                <FieldLabel
                  htmlFor="course-schedule-fit"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  Fits my schedule
                </FieldLabel>
                <FieldDescription id="course-schedule-fit-desc">
                  Hide sections that overlap classes in your cart or enrolled
                  schedule.
                </FieldDescription>
              </div>
            </div>
          </Field>

          <Button
            onClick={() => void courseSearch()}
            disabled={isSearchDisabled}
            className="w-full font-semibold"
          >
            <SearchIcon data-icon="inline-start" />
            Search
          </Button>
        </FieldGroup>

        {isLoading ? (
          <div className="mt-4">
            <CircularProgressWithLabel value={progress} label={progressLabel} />
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm text-destructive">
            Error: {error.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );

  const hasSectionResults =
    courseData?.sections && Object.keys(courseData.sections).length > 0;

  const sectionCompareItems = useMemo(
    () =>
      filteredTableRows.map((row) => {
        const lec = row.lecture;
        if (!lec) {
          return null;
        }
        const labs = (row.labs ?? []).filter(Boolean) as ModifiedSection[];
        const multiLab = labs.length > 1;
        const pick =
          labClassByRowId[row.uniqueRowId] ?? defaultLabClassForGroup(row);
        const displaySection = lec;
        const selectedId = previewIdForGroupedRow(row, pick);

        return (
          <SectionCompareCard
            key={row.uniqueRowId}
            section={displaySection}
            isSelected={selectedId === selectedPreviewId}
            onSelect={() => handleRowPreview(row)}
            selectedLabClassNumber={
              multiLab && pick !== undefined ? pick : undefined
            }
            onLabClassChange={(classNbr) => {
              setLabClassByRowId((prev) => ({
                ...prev,
                [row.uniqueRowId]: classNbr,
              }));
              handleRowPreview(row, classNbr);
            }}
            addToCartSlot={<ToCartGroupedSectionCell {...row} />}
          />
        );
      }),
    [
      filteredTableRows,
      handleRowPreview,
      labClassByRowId,
      selectedPreviewId,
    ],
  );

  const resultsPanel = (
    <Card className="min-w-0 overflow-visible bg-card/80 shadow-sm">
      <CardHeader className="gap-1 pb-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Comparison workspace
        </div>
        <CardTitle className="text-base">Sections</CardTitle>
        <CardDescription>
          {hasSectionResults
            ? `${filteredTableRows.length} result${filteredTableRows.length === 1 ? "" : "s"}${filteredTableRows.length !== tableRows.length ? ` (of ${tableRows.length})` : ""}.`
            : undefined}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 space-y-3">
        {hasSectionResults ? (
          <SectionCompareList
            isEmpty={filteredTableRows.length === 0}
            emptyMessage="No sections match the current filters. Adjust instructor or schedule-fit options."
          >
            {sectionCompareItems}
          </SectionCompareList>
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <SearchIcon />
            </div>
            <p className="text-sm text-muted-foreground">{emptyStateMessage}</p>
          </div>
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
