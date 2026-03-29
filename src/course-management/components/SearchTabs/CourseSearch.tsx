import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { Column } from "primereact/column";
import {
  DataTable,
  type DataTableExpandedRows,
  type DataTableValueArray,
} from "primereact/datatable";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  GroupedSections,
  ModifiedSection,
  MergedCourseData,
} from "../../types/Section";
import { AppLogger } from "../../../utils/logger";
import { DEPT_COURSES } from "../../../degree-planning/DialogAutoCompleteKeys/CourseSearch/department_courses.typed";
import { TermIdByName } from "../../../degree-planning/DialogAutoCompleteKeys/TermID.ts";
import { CircularProgressWithLabel } from "../../../ui-system/components/shared/CircularProgressWithLabel.tsx";
import { fetchSingleCourseData } from "../../services/api/DialogMenuSearch/dataService";
import { sortSections } from "../../types/DataGridCourse";
import { CourseInfoCell } from "../DataGridCells/CourseInfoCell";
import { CourseTimeCell } from "../DataGridCells/CourseTimeCell";
import { GradeDistributionCell } from "../DataGridCells/GradeDistributionCell";
import { InfoCell } from "../DataGridCells/InfoCell";
import { RateMyProfessorCell } from "../DataGridCells/RateMyProfessorCell";
import { StatusAndSlotsCell } from "../DataGridCells/StatusAndSlotsCell";
import { ToCartButtonCell } from "../DataGridCells/ToCartButtonCell";
import type { CourseSearchData } from "../TabDataStore/TabData";

// Define the department course type
interface DeptCourse {
  course_id: string;
  course_title: string;
}

const searchButtonSx = {
  px: 2.5,
  minWidth: 112,
  height: 44,
  alignSelf: "start",
  mt: 0.5,
  fontWeight: 600,
  letterSpacing: 0.15,
  backgroundColor: "#2a3f64",
  backgroundImage: "none",
  boxShadow: 3,
  "&:hover": {
    backgroundColor: "#243657",
    boxShadow: 5,
  },
  "&:active": {
    backgroundColor: "#1d2d49",
  },
  "@media (prefers-color-scheme: dark)": {
    backgroundColor: "#3a5687",
    "&:hover": {
      backgroundColor: "#334d79",
    },
    "&:active": {
      backgroundColor: "#2b4268",
    },
  },
} as const;

/**
 * Course Search tab allowing users to select term, subject, and course, then fetch sections.
 *
 * @param {{ setCourseSearchTabData: (key: keyof CourseSearchData, value: any) => void; courseSearchData: CourseSearchData }} props Tab state setter and current state
 * @returns {JSX.Element} Course Search tab UI
 */
export default function CourseSearch({
  setCourseSearchTabData,
  courseSearchData,
}: {
  setCourseSearchTabData: (key: keyof CourseSearchData, value: any) => void;
  courseSearchData: CourseSearchData;
}) {
  // Local state for search lifecycle
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [courseData, setCourseData] = useState<MergedCourseData | null>(null);
  const [error, setError] = useState<Error | null>(null);

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
      await search(
        courseSearchData.searchSubject,
        courseSearchData.selectedCourseInfo.catalogNum,
        courseSearchData.selectedCourseInfo.id,
        courseSearchData.selectedTerm,
      );
    }
  };

  // Effect to clear fields when dependencies change
  useEffect(() => {
    if (!courseSearchData.searchSubject) {
      setCourseSearchTabData("searchCourse", null);
      setCourseSearchTabData("selectedCourseInfo", null);
    }
  }, [courseSearchData.searchSubject]);

  const handleCourseChange = (_: any, value: string | null) => {
    setCourseSearchTabData("searchCourse", value);

    if (value && courseSearchData.searchSubject) {
      AppLogger.info("Course change detected:", {
        value,
        searchSubject: courseSearchData.searchSubject,
      });
      const courseCode = value.split(" ")[0]; // This gets something like "CSC316"

      if (courseSearchData.searchSubject in DEPT_COURSES) {
        const deptCourses =
          DEPT_COURSES[
            courseSearchData.searchSubject as keyof typeof DEPT_COURSES
          ];

        if (courseCode in deptCourses) {
          const courseInfo = deptCourses[
            courseCode as keyof typeof deptCourses
          ] as unknown as DeptCourse;

          // Extract just the catalog number
          // This handles cases with different subject codes
          // Use a regex to extract the numeric portion (possibly with a letter suffix)
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

  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | DataTableValueArray | undefined
  >(undefined);
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
  const tableRows = useMemo(
    () =>
      courseData?.sections
        ? Object.values(courseData.sections)
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
                return section.labs.reduce(
                  (acc: (GroupedSections & { uniqueRowId: string })[], lab, labIndex) => {
                    acc.push({
                      labs: null,
                      lecture: lab,
                      uniqueRowId: `lab-only-${lab.section || `${index}-${labIndex}`}`,
                    });
                    return acc;
                  },
                  [],
                );
              }
              return [];
            })
            .sort(sortSections)
        : [],
    [courseData?.sections],
  );
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
  const rowExpansionTemplate = (data: GroupedSections) => {
    if (!data.labs) return null; // No labs to show
    return (
      <Box sx={{ width: "50%", display: "flex", flexDirection: "column" }}>
        <DataTable
          value={data.labs}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
        >
          <Column
            field="id"
            header="ID"
            body={(row: ModifiedSection) => row.section}
          />
          <Column
            field="to_cart_button"
            header=""
            body={(row: ModifiedSection) =>
              ToCartButtonCell(row, data.lecture || undefined)
            }
          />
          <Column field="section" header="Section" body={CourseInfoCell} />
          <Column
            field="availability"
            header="Status"
            body={StatusAndSlotsCell}
          />
        </DataTable>
      </Box>
    );
  };
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box
        sx={{
          width: "100%",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.default",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            mb: 2,
          }}
        >
          <Autocomplete
            id="term_selector"
            options={Object.keys(TermIdByName)}
            value={courseSearchData.selectedTerm}
            onChange={(_, value) =>
              setCourseSearchTabData("selectedTerm", value)
            }
            renderInput={(params) => <TextField {...params} label="Term" />}
          />
          <Autocomplete
            id="subject_selector"
            options={Object.keys(DEPT_COURSES)}
            value={courseSearchData.searchSubject}
            onChange={(_, value) =>
              setCourseSearchTabData("searchSubject", value)
            }
            renderInput={(params) => <TextField {...params} label="Subject" />}
          />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Autocomplete
            id="course_selector"
            options={courseOptions}
            value={courseSearchData.searchCourse}
            onChange={handleCourseChange}
            noOptionsText={
              courseSearchData.searchSubject
                ? "No courses match this subject"
                : "Pick a subject to see available courses"
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Course"
                placeholder={
                  courseSearchData.searchSubject
                    ? "Type course code or title"
                    : "Select subject first"
                }
                helperText={courseHelperText}
              />
            )}
          />
          <Button
            color="secondary"
            variant="contained"
            size="medium"
            sx={searchButtonSx}
            onClick={courseSearch}
            disabled={isSearchDisabled}
          >
            Search
          </Button>
        </Box>
        {isLoading && (
          <Box sx={{ mt: 2 }}>
            <CircularProgressWithLabel value={progress} label={progressLabel} />
          </Box>
        )}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error: {error.message}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          mt: 2,
          mb: 2,
        }}
      >
        {courseData?.sections && Object.keys(courseData.sections).length > 0 ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <DataTable
              dataKey="uniqueRowId"
              value={tableRows}
              paginator
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rowExpansionTemplate={rowExpansionTemplate}
              rows={100}
              className="custom-datatable"
              rowsPerPageOptions={[10, 25, 50]}
            >
              <Column
                expander={(row) => row.labs && row.labs.length > 0}
                header=""
                style={{ width: "2.5rem" }}
              ></Column>
              <Column
                field="to_cart_button"
                header="Action"
                style={{ width: "118px" }}
                body={(params: GroupedSections) =>
                  params.lecture && ToCartButtonCell(params.lecture)
                }
              />
              <Column
                field="availability"
                header="Status"
                style={{ width: "140px" }}
                body={(params: GroupedSections) =>
                  params.lecture && StatusAndSlotsCell(params.lecture)
                }
              />
              <Column
                field="section"
                header="Course Info"
                style={{ width: "170px" }}
                body={(params: GroupedSections) =>
                  params.lecture && CourseInfoCell(params.lecture)
                }
              />
              <Column
                field="dayTime"
                header="Time"
                style={{ width: "190px" }}
                body={(params: GroupedSections) =>
                  params.lecture && CourseTimeCell(params.lecture)
                }
              />
              <Column
                field="instructor_name"
                header="Instructor"
                style={{ width: "240px" }}
                body={(row: GroupedSections) =>
                  Array.isArray(row.lecture?.instructor_name)
                    ? row.lecture?.instructor_name.join(", ")
                    : row.lecture?.instructor_name
                }
              />

              <Column
                field="professor_rating"
                header="Rating"
                style={{ width: "130px" }}
                body={(params: GroupedSections) =>
                  params.lecture && RateMyProfessorCell(params.lecture)
                }
              />
              <Column
                field="grade_distribution"
                header="Grades"
                style={{ width: "130px" }}
                body={(params: GroupedSections) =>
                  params.lecture && GradeDistributionCell(params.lecture)
                }
              />
              <Column
                field="info"
                header="Info"
                style={{ width: "72px" }}
                body={(params: GroupedSections) =>
                  params.lecture && InfoCell(params.lecture)
                }
              />
            </DataTable>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
              gap: 2,
            }}
          >
            <SearchIcon sx={{ fontSize: 56, color: "primary.main", opacity: 0.35 }} />
            <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
              {courseData
                ? "No sections found for this course"
                : "Select a term, subject, and course above to search"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
