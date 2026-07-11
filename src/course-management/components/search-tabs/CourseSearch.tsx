import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { DEPT_COURSES } from "../../../generated/catalogs/course-search/departmentCourses.typed";
import { TermIdByName } from "../../../generated/catalogs/termIds";
import {
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
import { fetchPlannerCourseSections } from "../../services/api/planner-search/dataService";
import type { GroupedSections, MergedCourseData } from "../../types/section";
import type { CourseSearchData, TabUpdater } from "../tab-state/tabState";

import { CourseSectionsCardList } from "./CourseSectionsCardList";

interface DeptCourse {
  course_id: string;
  course_title: string;
}

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

        const result = await fetchPlannerCourseSections(
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

  const handleTermChange = (value: string | null) => {
    setCourseSearchTabData({
      selectedTerm: value,
      instructorFilter: null,
    });
    onPreviewSectionChange(null);
  };

  const handleSubjectChange = (value: string | null) => {
    setCourseSearchTabData({
      searchSubject: value,
      searchCourse: null,
      selectedCourseInfo: null,
      instructorFilter: null,
    });
    onPreviewSectionChange(null);
  };

  const handleCourseChange = (value: string | null) => {
    setCourseSearchTabData({
      searchCourse: value,
      instructorFilter: null,
    });
    onPreviewSectionChange(null);

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

          setCourseSearchTabData({
            searchCourse: value,
            instructorFilter: null,
            selectedCourseInfo: {
              code: courseCode,
              catalogNum: catalogNum,
              title: courseInfo.course_title,
              id: courseInfo.course_id,
            },
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

  const sectionsArray = useMemo((): GroupedSections[] => {
    if (!courseData?.sections) {
      return [];
    }
    return Object.values(courseData.sections);
  }, [courseData?.sections]);

  const instructorOptions = useMemo(() => {
    const names = new Set<string>();
    for (const section of sectionsArray) {
      const lecture = section.lecture;
      if (!lecture) {
        continue;
      }
      const s = formatSectionInstructors(lecture).trim();
      if (s) {
        names.add(s);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [sectionsArray]);

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
  const controlsPanel = (
    <PlannerPanel
      eyebrow="Course Search"
      title="Parameters"
      description="Pick a term, subject, and course to load section comparisons."
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="term_selector">Term</FieldLabel>
          <PlannerFilterCombobox
            items={Object.keys(TermIdByName)}
            value={courseSearchData.selectedTerm}
            onValueChange={handleTermChange}
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
            onValueChange={handleSubjectChange}
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
          <FieldLabel htmlFor="course_instructor_filter">Instructor</FieldLabel>
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

        <ScheduleFitField
          id="course-schedule-fit"
          checked={courseSearchData.scheduleFitOnly}
          onCheckedChange={(checked) =>
            setCourseSearchTabData("scheduleFitOnly", checked)
          }
        />

        <SearchSubmitButton
          onClick={() => void courseSearch()}
          disabled={isSearchDisabled}
          showIcon
        />
      </FieldGroup>

      {isLoading ? (
        <div className="mt-4 flex w-full justify-center">
          <CircularProgressWithLabel value={progress} label={progressLabel} />
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-destructive">Error: {error.message}</p>
      ) : null}
    </PlannerPanel>
  );

  const hasSectionResults =
    courseData?.sections && Object.keys(courseData.sections).length > 0;

  const resultsPanel = (
    <PlannerPanel
      eyebrow="Comparison workspace"
      title="Sections"
      description={
        hasSectionResults
          ? `${sectionsArray.length} section group${sectionsArray.length === 1 ? "" : "s"} loaded.`
          : undefined
      }
      actions={
        <SectionDensityToggle
          value={courseSearchData.compactSections ? "compact" : "comfy"}
          onValueChange={(value) =>
            setCourseSearchTabData("compactSections", value === "compact")
          }
        />
      }
      contentClassName="min-w-0 space-y-3"
      headerClassName="pb-3"
    >
      {hasSectionResults ? (
        <CourseSectionsCardList
          tab="course_search"
          sections={sectionsArray}
          rowKeyPrefix="course-search-"
          selectedPreviewId={selectedPreviewId}
          onPreviewSectionChange={onPreviewSectionChange}
          instructorFilter={courseSearchData.instructorFilter}
          scheduleFitOnly={courseSearchData.scheduleFitOnly}
          scheduleBackground={scheduleBackground}
          compact={courseSearchData.compactSections}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <SearchIcon />
          </div>
          <p className="text-sm text-muted-foreground">{emptyStateMessage}</p>
        </div>
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
