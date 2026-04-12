import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  FormControlLabel,
  ListItem,
  ListItemText,
  Typography,
  Checkbox,
  Button,
  TextField,
  Autocomplete,
  type AutocompleteRenderInputParams,
} from "@mui/material";
import { Column } from "primereact/column";
import {
  DataTable,
  type DataTableExpandedRows,
  type DataTableValueArray,
  type DataTableRowToggleEvent,
} from "primereact/datatable";
import React, { useMemo, useCallback, useState } from "react";

import type {
  GroupedSections,
  MergedCourseData,
  ModifiedSection,
} from "../../types/Section";
import { AppLogger } from "../../../utils/logger.ts";
import { GEP_COURSES } from "../../../degree-planning/DialogAutoCompleteKeys/GEPSearch/gep_courses.typed.ts";
import { SubjectMenuValues } from "../../../degree-planning/DialogAutoCompleteKeys/SubjectSearchValues";
import { TermIdByName } from "../../../degree-planning/DialogAutoCompleteKeys/TermID.ts";
import type { RequiredCourse } from "../../../degree-planning/types/Plans";
import { CircularProgressWithLabel } from "../../../ui-system/components/shared/CircularProgressWithLabel";
import { logEvent } from "../../../analytics/ga4";
import { fetchGEPCourseData } from "../../services/api/DialogMenuSearch/dataService";
import { sortSections } from "../../types/DataGridCourse";
import { CourseInfoCell } from "../DataGridCells/CourseInfoCell";
import { CourseTimeCell } from "../DataGridCells/CourseTimeCell";
import { GradeDistributionCell } from "../DataGridCells/GradeDistributionCell";
import { InfoCell } from "../DataGridCells/InfoCell";
import { RateMyProfessorCell } from "../DataGridCells/RateMyProfessorCell";
import { StatusAndSlotsCell } from "../DataGridCells/StatusAndSlotsCell";
import { ToCartButtonCell } from "../DataGridCells/ToCartButtonCell";
import { type GEPData, type TabUpdater } from "../TabDataStore/TabData";
import { searchButtonSx } from "./searchStyles";

interface AutocompletesProps {
  selectedTerm: string | null;
  searchSubject: string | null;
  setGepSearchTabData: TabUpdater<GEPData>;
}

const TERM_OPTIONS = Object.keys(TermIdByName);

const SUBJECT_OPTIONS = Object.keys(GEP_COURSES);

const MemoizedAutocompletes: React.FC<AutocompletesProps> = React.memo(
  ({ selectedTerm, searchSubject, setGepSearchTabData }) => {
    const handleTermChange = useCallback(
      (_: React.SyntheticEvent, value: string | null) => {
        setGepSearchTabData("selectedTerm", value);
      },
      [setGepSearchTabData],
    );

    const handleSubjectChange = useCallback(
      (_: React.SyntheticEvent, value: string | null) => {
        setGepSearchTabData("searchSubject", value);
      },
      [setGepSearchTabData],
    );

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          width: "100%",
        }}
      >
        <Autocomplete
          id="term_selector"
          options={TERM_OPTIONS}
          value={selectedTerm}
          defaultValue={TERM_OPTIONS[0]}
          onChange={handleTermChange}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField {...params} label="Term" />
          )}
        />
        <Autocomplete
          id="subject_selector"
          options={SUBJECT_OPTIONS}
          value={searchSubject}
          onChange={handleSubjectChange}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField {...params} label="GEP Subject" />
          )}
        />
      </Box>
    );
  },
);

const MemoizedDataTable = React.memo(
  ({
    sections,
    sortFunc,
  }: {
    sections: GroupedSections[];
    sortFunc: (a: GroupedSections, b: GroupedSections) => number;
  }) => {
    const [expandedRows, setExpandedRows] = useState<
      DataTableExpandedRows | DataTableValueArray | undefined
    >(undefined);

    const rowExpansionTemplate = (data: GroupedSections) => {
      if (!data.labs || data.labs.length === 0) return null;
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

    const processedSections = useMemo(() => {
      return [...sections].sort(sortFunc).flatMap((section, index) => {
        if (section.lecture) {
          return [
            {
              ...section,
              id: section.lecture.classNumber || `grouped-${index}`,
            },
          ];
        }
        if (section.labs && section.labs.length > 0) {
          return section.labs.map((lab, labIndex) => ({
            lecture: lab,
            labs: [],
            id: lab.classNumber || `lab-only-${index}-${labIndex}`,
          }));
        }
        return [];
      });
    }, [sections, sortFunc]);

    return (
      <>
        <DataTable
          dataKey="id"
          value={processedSections}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          className="custom-datatable"
          expandedRows={expandedRows}
          onRowToggle={(e: DataTableRowToggleEvent) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column
            expander={(row: GroupedSections) =>
              !!row.labs && row.labs.length > 0
            }
            style={{ width: "3em" }}
          />
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
      </>
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
}

const CourseSections = React.memo(
  ({ courseDataEntry }: { courseDataEntry: MergedCourseData | undefined }) => {
    const sections = useMemo(() => {
      if (courseDataEntry?.sections) {
        return Object.values(courseDataEntry.sections);
      }
      return [];
    }, [courseDataEntry?.sections]);

    if (sections.length > 0) {
      return (
        <Box sx={{ height: "auto", width: "100%", display: "flex" }}>
          <MemoizedDataTable sections={sections} sortFunc={sortSections} />
        </Box>
      );
    }

    return (
      <Typography
        variant="body2"
        sx={{ p: 2, color: "text.secondary", fontStyle: "italic" }}
      >
        No sections available
      </Typography>
    );
  },
);

const GEPTree: React.FC<GEPTreeProps> = React.memo(
  ({ groupedData, expandedGroups, onToggleGroup, courseData }) => {
    return (
      <Box sx={{ width: "100%" }}>
        {groupedData.map((group) => (
          <React.Fragment key={`group-fragment-${group.courseAbr}`}>
            <Box
              key={`group-${group.courseAbr}`}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                px: 2,
                py: 1.25,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              onClick={() => onToggleGroup(group.courseAbr)}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {group.displayTitle} ({group.courses.length})
              </Typography>
              {expandedGroups[group.courseAbr] ? (
                <ExpandMoreIcon sx={{ color: "primary.main" }} />
              ) : (
                <ChevronRightIcon sx={{ color: "text.secondary" }} />
              )}
            </Box>
            {expandedGroups[group.courseAbr] &&
              group.courses.map((course) => {
                const courseKey = `${course.course_abr} ${course.catalog_num}`;
                const courseDataEntry = (
                  courseData as Record<string, MergedCourseData>
                )[courseKey];
                return (
                  <ListItem
                    key={`course-${courseKey}`}
                    alignItems="flex-start"
                    sx={{
                      paddingLeft: "20px",
                      py: 1,
                      minHeight: "auto",
                      display: "flex",
                      flexDirection: "column",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <ListItemText
                        primary={`${course.course_descrip} (${course.course_abr} ${parseInt(course.catalog_num)})`}
                        secondary={courseKey}
                        sx={{ mb: 1 }}
                      />
                      <CourseSections courseDataEntry={courseDataEntry} />
                    </Box>
                  </ListItem>
                );
              })}
          </React.Fragment>
        ))}
      </Box>
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
}: {
  setGepSearchTabData: TabUpdater<GEPData>;
  gepSearchData: GEPData;
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
  } = gepSearchData;
  const isSearchDisabled = !selectedTerm || !searchSubject;

  const courseSearch = useCallback(async () => {
    void logEvent("gep_search_clicked", {
      tab: "gep_search",
      term: selectedTerm ?? "unknown",
      subject: searchSubject ?? "unknown",
    });
    setExpandedGroups({});
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
  }, [selectedTerm, searchSubject, setGepSearchTabData]);

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
    (_: React.SyntheticEvent, checked: boolean) => {
      setGepSearchTabData("hideNoSections", checked);
    },
    [setGepSearchTabData],
  );

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box
        sx={{
          p: 2,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.default",
          borderRadius: 2,
        }}
      >
        <MemoizedAutocompletes
          selectedTerm={selectedTerm}
          searchSubject={searchSubject}
          setGepSearchTabData={setGepSearchTabData}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "auto 1fr" },
            alignItems: "center",
            gap: 2,
            mt: 2,
          }}
        >
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
          <FormControlLabel
            control={
              <Checkbox
                checked={hideNoSections}
                onChange={handleHideNoSectionsChange}
              />
            }
            label="Hide courses with no open sections"
          />
        </Box>
        {!isLoaded && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgressWithLabel
              value={progress}
              label={progressLabel || ""}
            />
          </Box>
        )}
      </Box>

      {isLoaded && groupedAndFilteredCourses.length > 0 && (
        <GEPTree
          groupedData={groupedAndFilteredCourses}
          expandedGroups={expandedGroups}
          onToggleGroup={handleToggleGroup}
          courseData={courseData}
        />
      )}
      {isLoaded && groupedAndFilteredCourses.length === 0 && (
        <Typography
          variant="body1"
          sx={{ p: 4, textAlign: "center", color: "text.secondary" }}
        >
          No GEP courses found matching your criteria.{" "}
          {hideNoSections &&
            "Try unchecking 'Hide courses with no open sections'."}
        </Typography>
      )}
    </Box>
  );
}
