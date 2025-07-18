import { type PlanSearchData } from '../TabDataStore/TabData';
import { useState, useMemo, memo } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  DialogContent,
  
  List,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

import { sortSections } from '../../types/DataGridCourse';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { DataTable, type DataTableValueArray, type DataTableExpandedRows, type DataTableRowToggleEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ToCartButtonCell } from '../DataGridCells/ToCartButtonCell';
import { StatusAndSlotsCell } from '../DataGridCells/StatusAndSlotsCell';
import { CourseInfoCell } from '../DataGridCells/CourseInfoCell';
import { RateMyProfessorCell } from '../DataGridCells/RateMyProfessorCell';
import { GradeDistributionCell } from '../DataGridCells/GradeDistributionCell';
import { InfoCell } from '../DataGridCells/InfoCell';
import type { GroupedSections, MergedCourseData } from '../../../core/utils/CourseSearch/MergeDataUtil';
import type { ModifiedSection } from '../../../core/utils/CourseSearch/MergeDataUtil';
import { AppLogger } from '../../../core/utils/logger';
import { majorPlans } from '../../../degree-planning/DialogAutoCompleteKeys/PlanSearch/MajorPlans';
import type { MajorPlan, MinorPlan, RequiredCourse, Subplan } from '../../../degree-planning/types/Plans';
import { minorPlans } from '../../../degree-planning/DialogAutoCompleteKeys/PlanSearch/MinorPlans';
import { fetchCourseSearchData } from '../../services/api/DialogMenuSearch/dataService';
import { TermIdByName } from '../../../degree-planning/DialogAutoCompleteKeys/TermID';
import { CircularProgressWithLabel } from '../../../ui-system/components/shared/CircularProgressWithLabel';
import { customDataTableStyles } from '../../../ui-system/styles/dataTableStyles';

const CourseSectionsDataTable = ({ sections }: { sections: GroupedSections[] }) => {
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | DataTableValueArray | undefined>(undefined);

  const rowExpansionTemplate = (data: GroupedSections) => {
    AppLogger.info("Row expansion template in Plan Search", { data });
    if (!data.labs || data.labs.length === 0) return null;
    return (
      <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
        <DataTable value={data.labs} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
          <Column field="id" header="ID" body={(row: ModifiedSection) => row.section} />
          <Column field="to_cart_button" header="" body={(row: ModifiedSection) => ToCartButtonCell(row, data.lecture || undefined)} />
          <Column field="section" header="Section" body={CourseInfoCell} />
          <Column field="availability" header="Status" body={StatusAndSlotsCell} />
        </DataTable>
      </Box>
    );
  };

  const processedSections = useMemo(() => {
    return sections.sort(sortSections).flatMap((section, index) => {
        if (section.lecture) {
            return [{
                ...section,
                id: section.lecture.classNumber || `grouped-${index}`
            }];
        }
                if (section.labs && section.labs.length > 0) {
            return section.labs.map((lab, labIndex) => ({
                lecture: lab,
                labs: [],
                id: lab.classNumber || `lab-only-${index}-${labIndex}`
            }));
        }
        return [];
    });
}, [sections]);

  return (
    <>
      <style>{customDataTableStyles}</style>
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
        <Column expander={(row: GroupedSections) => !!row.labs && row.labs.length > 0} style={{ width: '3em' }} />
        <Column field="to_cart_button" header="" body={(params: GroupedSections) => params.lecture && ToCartButtonCell(params.lecture)} />
        <Column field="availability" header="Status" body={(params: GroupedSections) => params.lecture && StatusAndSlotsCell(params.lecture)} />
        <Column field="section" header="Course Info" body={(params: GroupedSections) => params.lecture && CourseInfoCell(params.lecture)} />
        <Column field="instructor_name" header="Instructor" body={(row: GroupedSections) => Array.isArray(row.lecture?.instructor_name) ? row.lecture?.instructor_name.join(', ') : row.lecture?.instructor_name} />
        <Column field="professor_rating" header="Rating" body={(params: GroupedSections) => params.lecture && RateMyProfessorCell(params.lecture)} />
        <Column field="grade_distribution" header="Grades" body={(params: GroupedSections) => params.lecture && GradeDistributionCell(params.lecture)} />
        <Column field="info" header="Info" body={(params: GroupedSections) => params.lecture && InfoCell(params.lecture)} />
      </DataTable>
    </>
  );
};

const MemoizedCourseSectionsDataTable = memo(CourseSectionsDataTable);

const CourseDisplay = memo(({ course, openCourses }: { course: RequiredCourse, openCourses: Record<string, MergedCourseData> | null }) => {
    const courseData = openCourses?.[`${course.course_abr} ${course.catalog_num}`];
    const sections = courseData?.sections;

    const sectionsArray = useMemo(() => {
        if (sections && Object.keys(sections).length > 0) {
            return Object.values(sections);
        }
        return null;
    }, [sections]);

    if (sectionsArray) {
        return (
            <Box sx={{ height: '100%', width: '100%', display: 'flex' }}>
                <MemoizedCourseSectionsDataTable sections={sectionsArray} />
            </Box>
        );
    }

    return (
        <Typography variant="body1" sx={{ p: 3, color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem', textAlign: 'center', fontStyle: 'italic' }}>
            No sections available
        </Typography>
    );
});

export default function PlanSearch({setPlanSearchTabData, planSearchData}: {setPlanSearchTabData: (key: keyof PlanSearchData, value: any) => void, planSearchData: PlanSearchData}) {
 
  const major_options = Object.keys(majorPlans);
  const minor_options = Object.keys(minorPlans);
 


  const subplanOptions = planSearchData.selectedMajor
    ? Object.keys(majorPlans[planSearchData.selectedMajor as keyof typeof majorPlans]?.subplans || {})
    : [];

  // const handleClick = (event: React.SyntheticEvent, nodeId: string) => {
  //   AppLogger.info("Requirement clicked:", { nodeId });
  //   AppLogger.info("Open state:", planSearchData.open);
  //   setPlanSearchTabData('open', nodeId);
  // };

  const planSearch = async () => {
    setPlanSearchTabData('progress', 10); // start
    setPlanSearchTabData('progressLabel', 'Initializing plan search...');
    setPlanSearchTabData('searchMajor', planSearchData.selectedMajor);
    setPlanSearchTabData('searchMinor', planSearchData.selectedMinor);
    setPlanSearchTabData('searchSubplan', planSearchData.selectedSubplan);
    setPlanSearchTabData('isLoaded', false);
    AppLogger.info("Search clicked with:", { 
      selectedMajor: planSearchData.selectedMajor, 
      selectedSubplan: planSearchData.selectedSubplan, 
      selectedTerm: planSearchData.selectedTerm 
    });
    // Call the async logic
    await fetchOpenCourses(planSearchData.selectedMajor, planSearchData.selectedMinor, planSearchData.selectedSubplan, planSearchData.selectedTerm);
    setPlanSearchTabData('progress', 100); // done
    setPlanSearchTabData('progressLabel', 'Complete');
  };

  const fetchOpenCourses = async (major: string | null, minor :string | null, subplan: string | null, term: string | null) => {
    setPlanSearchTabData('progress', 10);
    setPlanSearchTabData('progressLabel', `Preparing to search for ${major} - ${subplan} courses`);
    AppLogger.info('fetchOpenCourses called with:', { major, subplan, term });
    
    if (((major && subplan) || (minor)) && term) {
      try {
        setPlanSearchTabData('progress', 15);
        setPlanSearchTabData('progressLabel', `Loading ${major} plan data`);
        const major_data = majorPlans[major as keyof typeof majorPlans] as MajorPlan;
        const subplan_data = major_data?.subplans[subplan as keyof typeof major_data.subplans] as Subplan | undefined;
        const minor_data = minorPlans[minor as keyof typeof minorPlans] as MinorPlan | undefined;
        if (!subplan_data && !minor_data) {
          AppLogger.error("No subplan data found for", subplan);
          setPlanSearchTabData('progressLabel', `Error: No data found for ${subplan}`);
          return;
        }
        
        const major_requirements = subplan_data?.requirements ?? {};
        const minor_requirements = minor_data?.requirements ?? {};
        const requirements = { ...minor_requirements, ...major_requirements };
        setPlanSearchTabData('open', Object.keys(requirements).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {} as Record<string, boolean>));
        const reqCount = Object.keys(requirements).length;
        setPlanSearchTabData('progressLabel', `Processing ${reqCount} requirements for ${subplan}`);
        AppLogger.info("Requirements:", Object.keys(requirements));
        setPlanSearchTabData('progress', 20);

        const newOpenCourses: Record<string, MergedCourseData> = {};
        
        // Pass progress callback with status message support
        const data = await fetchCourseSearchData(
          Object.values(requirements), 
          term,
          (progressVal, statusMessage) => {
            // Scale the progress to fit between 20-90%
            setPlanSearchTabData('progress', 20 + Math.round(progressVal * 0.7));
            
            // Update progress label from the status message if provided
            if (statusMessage) {
              setPlanSearchTabData('progressLabel', statusMessage);
            }
          }
        );

        if (!data) {
          AppLogger.error("No data returned from fetchCourseSearchData");
          setPlanSearchTabData('progressLabel', `Error: No course data found for ${major} - ${subplan}`);
          return;
        }

        AppLogger.info("Data returned from API:", data);
        setPlanSearchTabData('progress', 90);
        setPlanSearchTabData('progressLabel', 'Processing course sections');
        
        for (const [courseKey, course] of Object.entries(data)) {
          // Ensure each section has a unique ID
  
          newOpenCourses[courseKey] = course;
        }
        
        setPlanSearchTabData('progress', 95);
        setPlanSearchTabData('progressLabel', 'Finalizing search results');
        AppLogger.info("Setting openCourses with:", newOpenCourses);
        setPlanSearchTabData('isLoaded', true);
        setPlanSearchTabData('openCourses', newOpenCourses);
        AppLogger.info('Updated open courses:', newOpenCourses);
      } catch (error) {
        AppLogger.error("Error in fetchOpenCourses:", error);
        setPlanSearchTabData('progressLabel', `Error fetching courses: ${error}`);
      } finally {
        setPlanSearchTabData('progress', 100);
        setPlanSearchTabData('progressLabel', 'Complete');
      }
    }
  };

  // Build requirements list if search was performed
  let requirementsList = null;
  if (((planSearchData.selectedMajor && planSearchData.selectedSubplan ) || (planSearchData.selectedMinor)) && planSearchData.selectedTerm) {
    const major_data = majorPlans[planSearchData.selectedMajor as keyof typeof majorPlans] as MajorPlan;
    const subplan_data = major_data?.subplans[planSearchData.selectedSubplan as keyof typeof major_data.subplans] as Subplan | undefined;
    const minor_data = minorPlans[planSearchData.selectedMinor as keyof typeof minorPlans] as MinorPlan | undefined;
    const major_requirements = subplan_data?.requirements ?? {};
    const minor_requirements = minor_data?.requirements ?? {};
    AppLogger.info(`[PLAN SEARCH] Major Requirements:`, major_requirements);
    AppLogger.info(`[PLAN SEARCH] Minor Requirements:`, minor_requirements);
    const requirements = { ...minor_requirements, ...major_requirements };
    AppLogger.info(`[PLAN SEARCH] Requirements:`, requirements);
    if (Object.keys(requirements).length > 0) {
      requirementsList = (
        <SimpleTreeView 
          sx={{
            '& .MuiTreeItem-root': {
              '& .MuiTreeItem-content': {
                backgroundColor: 'transparent !important',
                padding: '12px 16px',
                borderRadius: '8px',
                margin: '4px 0',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12) !important',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.16) !important',
                  },
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12) !important',
                },
              },
              '& .MuiTreeItem-label': {
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#ffffff',
                padding: '8px 0',
              },
              '& .MuiTreeItem-iconContainer': {
                color: 'rgba(255, 255, 255, 0.7)',
                '& svg': {
                  fontSize: '1.2rem',
                },
              },
            },
          }}
        >
          {Object.keys(requirements).map((requirementKey) => (
            <TreeItem
              key={requirementKey}
              itemId={requirementKey}
              label={requirementKey}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%',
                padding: '16px',
                backgroundColor: 'transparent',
              }}>
                {requirements[requirementKey].courses.filter((course: RequiredCourse) => {
                    if (planSearchData.hideNoSections) {
                        const courseData = (planSearchData.openCourses as Record<string, MergedCourseData>)?.[`${course.course_abr} ${course.catalog_num}`];
                        return !!courseData?.sections && Object.keys(courseData.sections).length > 0;
                    }
                    return true;
                }).map((course: RequiredCourse, index: number, filteredCourses: RequiredCourse[]) => (
                  <Box key={`${course.course_abr} ${course.catalog_num}`} sx={{ mb: 3 }}>
                    {/* Course Header */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        mb: 2,
                        pb: 1,
                        borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {course.course_descrip} ({course.course_abr} {parseInt(course.catalog_num)})
                    </Typography>
                    
                    {/* Course Content */}
                    <Box sx={{ 
                      width: '100%', 
                      mb: 2
                    }}>
                      <CourseDisplay course={course} openCourses={planSearchData.openCourses} />
                    </Box>
                    
                    {/* Divider between courses (except for the last one) */}
                    {index < filteredCourses.length - 1 && (
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: '1px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                          my: 3 
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
    }
  }

  return (

    <DialogContent>
      <Box sx={{ width: '100%', p: 2 }}>
        <List>
          
          <Autocomplete
            sx={{ width: '50%', mb: 1 }}
            id="term_selector"
            options={Object.keys(TermIdByName)}
            value={planSearchData.selectedTerm}
            onChange={(_, value) => setPlanSearchTabData('selectedTerm', value)}
            renderInput={(params) => 
              <TextField {...params} label="Term" sx={{ padding: '10px' }} />
            }
          />
          
          <Autocomplete
            sx={{ width: '50%', mb: 1 }}
            id="major_selector"
            options={major_options}
            value={planSearchData.selectedMajor}
            onChange={(_, value) => setPlanSearchTabData('selectedMajor', value)}
            renderInput={(params) => 
              <TextField {...params} label="Major" sx={{ padding: '10px' }} />
            }
          />
          
          <Autocomplete
            sx={{ width: '50%', mb: 1 }}
            id="minor_selector"
            options={minor_options}
            value={planSearchData.selectedMinor}
            onChange={(_, value) => setPlanSearchTabData('selectedMinor', value)}
            renderInput={(params: any) => 
              <TextField {...params} label="Minor" sx={{ padding: '10px' }} />
            }
          />
          
          <Autocomplete
            sx={{ width: '50%', mb: 1 }}
            id="subplan_selector"
            options={subplanOptions}
            value={planSearchData.selectedSubplan}
            onChange={(_, value) => setPlanSearchTabData('selectedSubplan', value)}
            renderInput={(params: any) => 
              <TextField {...params} label="Subplan" sx={{ padding: '10px' }} />
            }
          />
          
          <Button
            variant='outlined'
            sx={{ width: '50%', mb: 1 }}
            onClick={planSearch}
          >
            Search
          </Button>
          <FormControlLabel
            control={<Checkbox checked={planSearchData.hideNoSections}  onChange={(_, checked: boolean) => setPlanSearchTabData('hideNoSections', checked)} />}
            label="Hide courses with no open sections"
          />
          {!planSearchData.isLoaded && <CircularProgressWithLabel value={planSearchData.progress} label={planSearchData.progressLabel || ''} />}
          {planSearchData.isLoaded && requirementsList}
        </List>
      </Box>
    </DialogContent>
  );
} 