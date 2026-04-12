import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  Box,
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Column } from "primereact/column";
import {
  DataTable,
  type DataTableValueArray,
  type DataTableExpandedRows,
  type DataTableRowToggleEvent,
} from "primereact/datatable";
import { useState, useMemo, memo } from "react";

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
import { AppLogger } from "../../../utils/logger";
import { fetchCourseSearchData } from "../../services/api/DialogMenuSearch/dataService";
import { sortSections } from "../../types/DataGridCourse";
import type {
  GroupedSections,
  MergedCourseData,
  ModifiedSection,
} from "../../types/Section";
import { CourseInfoCell } from "../DataGridCells/CourseInfoCell";
import { CourseTimeCell } from "../DataGridCells/CourseTimeCell";
import { GradeDistributionCell } from "../DataGridCells/GradeDistributionCell";
import { InfoCell } from "../DataGridCells/InfoCell";
import { RateMyProfessorCell } from "../DataGridCells/RateMyProfessorCell";
import { StatusAndSlotsCell } from "../DataGridCells/StatusAndSlotsCell";
import { ToCartButtonCell } from "../DataGridCells/ToCartButtonCell";
import { type PlanSearchData, type TabUpdater } from "../TabDataStore/TabData";

import { searchButtonSx } from "./searchStyles";

const requirementTreeSx = {
  "& .MuiTreeItem-root": {
    "& .MuiTreeItem-content": {
      backgroundColor: "transparent !important",
      padding: "12px 16px",
      borderRadius: "8px",
      margin: "4px 0",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderColor: "divider",
      "&:hover": {
        backgroundColor: "action.hover !important",
      },
      "&.Mui-selected": {
        backgroundColor: "action.selected !important",
        "&:hover": {
          backgroundColor: "action.selected !important",
        },
      },
      "&.Mui-focused": {
        backgroundColor: "action.selected !important",
      },
    },
    "& .MuiTreeItem-label": {
      fontSize: "1rem",
      fontWeight: 600,
      color: "text.primary",
      padding: "8px 0",
    },
    "& .MuiTreeItem-iconContainer": {
      color: "text.secondary",
      "& svg": {
        fontSize: "1rem",
      },
    },
  },
} as const;

const CourseSectionsDataTable = ({
  sections,
}: {
  sections: GroupedSections[];
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
    return [...sections].sort(sortSections).flatMap((section, index) => {
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
  }, [sections]);

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
          expander={(row: GroupedSections) => !!row.labs && row.labs.length > 0}
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
};

const MemoizedCourseSectionsDataTable = memo(CourseSectionsDataTable);

const CourseDisplay = memo(
  ({
    course,
    openCourses,
  }: {
    course: RequiredCourse;
    openCourses: Record<string, MergedCourseData> | null;
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
        <Box sx={{ height: "100%", width: "100%", display: "flex" }}>
          <MemoizedCourseSectionsDataTable sections={sectionsArray} />
        </Box>
      );
    }

    return (
      <Typography
        variant="body1"
        sx={{
          p: 3,
          color: "text.secondary",
          fontSize: "1rem",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        No sections available
      </Typography>
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
}: {
  setPlanSearchTabData: TabUpdater<PlanSearchData>;
  planSearchData: PlanSearchData;
}) {
  const major_options = Object.keys(majorPlans);
  const minor_options = Object.keys(minorPlans);
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
        setPlanSearchTabData(
          "open",
          Object.keys(requirements).reduce(
            (acc, key) => {
              acc[key] = false;
              return acc;
            },
            {} as Record<string, boolean>,
          ),
        );
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

  const requirementsList = useMemo(() => {
    if (requirementEntries.length === 0) {
      return null;
    }

    return (
      <SimpleTreeView sx={requirementTreeSx}>
        {requirementEntries.map(({ requirementKey, courses }) => (
          <TreeItem
            key={requirementKey}
            itemId={requirementKey}
            label={requirementKey}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                padding: "16px",
                backgroundColor: "transparent",
              }}
            >
              {courses.map((course: RequiredCourse, index: number) => (
                <Box
                  key={`${course.course_abr} ${course.catalog_num}`}
                  sx={{ mb: 3 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "text.primary",
                      fontSize: "1rem",
                      fontWeight: 500,
                      mb: 2,
                      pb: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {course.course_descrip} ({course.course_abr}{" "}
                    {parseInt(course.catalog_num)})
                  </Typography>

                  <Box
                    sx={{
                      width: "100%",
                      mb: 2,
                    }}
                  >
                    <CourseDisplay
                      course={course}
                      openCourses={planSearchData.openCourses}
                    />
                  </Box>

                  {index < courses.length - 1 && (
                    <Box
                      sx={{
                        width: "100%",
                        height: "1px",
                        backgroundColor: "divider",
                        my: 3,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </TreeItem>
        ))}
      </SimpleTreeView>
    );
  }, [requirementEntries, planSearchData.openCourses]);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box sx={{ width: "100%", p: 2 }}>
        <Box
          sx={{
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.default",
            borderRadius: 2,
            p: 2,
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
              value={planSearchData.selectedTerm}
              onChange={(_, value) =>
                setPlanSearchTabData("selectedTerm", value)
              }
              renderInput={(params) => <TextField {...params} label="Term" />}
            />
            <Autocomplete
              id="major_selector"
              options={major_options}
              value={planSearchData.selectedMajor}
              onChange={(_, value) =>
                setPlanSearchTabData("selectedMajor", value)
              }
              renderInput={(params) => <TextField {...params} label="Major" />}
            />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
              mb: 2,
            }}
          >
            <Autocomplete
              id="minor_selector"
              options={minor_options}
              value={planSearchData.selectedMinor}
              onChange={(_, value) =>
                setPlanSearchTabData("selectedMinor", value)
              }
              renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField {...params} label="Minor" />
              )}
            />
            <Autocomplete
              id="subplan_selector"
              options={subplanOptions}
              value={planSearchData.selectedSubplan}
              onChange={(_, value) =>
                setPlanSearchTabData("selectedSubplan", value)
              }
              renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField {...params} label="Subplan" />
              )}
            />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "auto 1fr" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              color="secondary"
              variant="contained"
              size="medium"
              sx={searchButtonSx}
              onClick={planSearch}
              disabled={isSearchDisabled}
            >
              Search
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={planSearchData.hideNoSections}
                  onChange={(_, checked: boolean) =>
                    setPlanSearchTabData("hideNoSections", checked)
                  }
                />
              }
              label="Hide courses with no open sections"
            />
          </Box>
          {!planSearchData.isLoaded && (
            <Box sx={{ mt: 2 }}>
              <CircularProgressWithLabel
                value={planSearchData.progress}
                label={planSearchData.progressLabel || ""}
              />
            </Box>
          )}
        </Box>
        {hasPlanSearchRun && requirementsList}
        {hasPlanSearchRun && !requirementsList && (
          <Typography
            sx={{ p: 3, color: "text.secondary", textAlign: "center" }}
          >
            No search results found for the selected plan and filters.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
