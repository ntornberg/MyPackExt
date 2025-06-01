import { useEffect, useState } from 'react';
import { 
  Autocomplete, 
  Box, 
  Button, 
  List, 
  TextField,
  DialogContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { TermIdByName } from '../../Data/TermID';
import { DEPT_COURSES } from '../../Data/CourseSearch/department_courses.typed';
import { AppLogger } from '../../utils/logger';
import { fetchSingleCourseData } from '../../services/api/CourseSearch/dataService';
import {  sortSections } from '../../types/DataGridCourse';
import { DataTable, type DataTableValueArray, type DataTableExpandedRows } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useMemoizedSearch } from '../../hooks/useMemoizedSearch';
import type { CourseSearchData } from '../TabDataStore/TabData';
import { ToCartButtonCell } from '../DataGridCells/ToCartButtonCell';
import { StatusAndSlotsCell } from '../DataGridCells/StatusAndSlotsCell';
import { CourseInfoCell } from '../DataGridCells/CourseInfoCell';
import { RateMyProfessorCell } from '../DataGridCells/RateMyProfessorCell';
import { GradeDistributionCell } from '../DataGridCells/GradeDistributionCell';

import type { GroupedSections, ModifiedSection } from '../../utils/CourseSearch/MergeDataUtil';
import { InfoCell } from '../DataGridCells/InfoCell';
const customStyles = `
  .custom-datatable .p-datatable-thead > tr > th {
    background-color: rgb(5, 7, 10) !important;
    color: white !important;
    border-color: rgb(30, 35, 45) !important;
  }
  
  .custom-datatable .p-datatable-tbody > tr:nth-child(even) {
    background-color: rgb(11, 14, 20) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-tbody > tr:nth-child(odd) {
    background-color: rgb(20, 25, 35) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-tbody > tr:hover {
    background-color: rgb(25, 30, 40) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-tbody > tr > td {
    border-color: rgb(30, 35, 45) !important;
  }
  
  .custom-datatable .p-row-toggler {
    color: white !important;
  }
  
  .custom-datatable .p-row-toggler:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-scrollable-body {
    background-color: rgb(20, 25, 35) !important;
  }
  
  /* Expanded row styling */
  .custom-datatable .p-datatable-row-expansion {
    background-color: rgb(15, 18, 25) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-row-expansion .card {
    background-color: rgb(20, 25, 35) !important;
    border: 1px solid rgb(30, 35, 45) !important;
    color: white !important;
  }
  
  .custom-datatable .p-datatable-row-expansion h5,
  .custom-datatable .p-datatable-row-expansion h6 {
    color: white !important;
  }
  
  .custom-datatable .p-datatable-row-expansion .border-300 {
    border-color: rgb(30, 35, 45) !important;
  }
`;
export function CircularProgressWithLabel({ value, label }: { value: number; label?: string }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" value={value} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography variant="caption" component="div" color="text.secondary" sx={{ mt: 1, textAlign: 'center', maxWidth: '200px' }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}

// Define the department course type
interface DeptCourse {
  course_id: string;
  course_title: string;
}

export default function CourseSearch({setCourseSearchTabData, courseSearchData}: {setCourseSearchTabData: (key: keyof CourseSearchData, value: any) => void, courseSearchData: CourseSearchData}) {

  // To store the selected course data from dropdown
  
  
  // Use the memoized search hook
  const { 
    search, 
    isLoading, 
    progress, 
    progressLabel, 
    data: courseData, 
    error 
  } = useMemoizedSearch(fetchSingleCourseData);

  const courseSearch = async () => {
    AppLogger.info("Course search clicked with:", { 
      selectedTerm: courseSearchData.selectedTerm, 
      searchSubject: courseSearchData.searchSubject, 
      selectedCourseInfo: courseSearchData.selectedCourseInfo 
    });
    
    if (courseSearchData.searchSubject && courseSearchData.selectedCourseInfo && courseSearchData.selectedTerm) {
      await search(
        courseSearchData.searchSubject,
        courseSearchData.selectedCourseInfo.catalogNum,
        courseSearchData.selectedCourseInfo.id,
        courseSearchData.selectedTerm
      );
    }
  };

  // Effect to clear fields when dependencies change
  useEffect(() => {
    if (!courseSearchData.searchSubject) {
      setCourseSearchTabData('searchCourse', null);
      setCourseSearchTabData('selectedCourseInfo', null);
    }
  }, [courseSearchData.searchSubject]);

  const handleCourseChange = (_: any, value: string | null) => {
    setCourseSearchTabData('searchCourse', value);
    
    if (value && courseSearchData.searchSubject) {
      AppLogger.info("Course change detected:", { 
        value, 
        searchSubject: courseSearchData.searchSubject 
      });
      const courseCode = value.split(' ')[0]; // This gets something like "CSC316"
      
      if (courseSearchData.searchSubject in DEPT_COURSES) {
        const deptCourses = DEPT_COURSES[courseSearchData.searchSubject as keyof typeof DEPT_COURSES];
        // Safely access the course info with type checking
        if (courseCode in deptCourses) {
          const courseInfo = deptCourses[courseCode as keyof typeof deptCourses] as unknown as DeptCourse;
          
          // Extract just the catalog number 
          // This handles cases with different subject codes
          // Use a regex to extract the numeric portion (possibly with a letter suffix)
          const match = courseCode.match(/[0-9]+[A-Za-z]?$/);
          const catalogNum = match ? match[0] : courseCode.replace(courseSearchData.searchSubject, '');
          
          AppLogger.info(`Extracted catalog number ${catalogNum} from course code ${courseCode}`);
          
          setCourseSearchTabData('selectedCourseInfo', {
            code: courseCode,
            catalogNum: catalogNum,
            title: courseInfo.course_title,
            id: courseInfo.course_id
          });
          return;
        }
      }
      setCourseSearchTabData('selectedCourseInfo', null);
    } else {
      setCourseSearchTabData('selectedCourseInfo', null);
    }
  };


  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | DataTableValueArray | undefined>(undefined);
  const rowExpansionTemplate = (data: GroupedSections) => {
   

    AppLogger.info("Row expansion template", { data });
    if (!data.labs) return null; // TODO: There must be a better way to do this
    return (
      <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
      <DataTable value={data.labs} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column field="id" header="ID" body={(row : ModifiedSection) => row.section}/>
        <Column field="to_cart_button" header="" body={ToCartButtonCell} />
        <Column field="section" header="Section" body={CourseInfoCell} />
        <Column field="availability" header="Status" body={StatusAndSlotsCell} />
      </DataTable>
      </Box>
    );
   };
  return (
    <DialogContent>
      <Box sx={{ width: '100%', p: 2 }}>
        <List>
          <Autocomplete
            sx={{ width: '50%', mb: 1 }}
            id="term_selector"
            options={Object.keys(TermIdByName)}
            defaultValue={TermIdByName[Object.keys(TermIdByName)[0]]}
            value={courseSearchData.selectedTerm}
            onChange={(_, value) => setCourseSearchTabData('selectedTerm', value)}
            renderInput={(params) => 
              <TextField {...params} label="Term" sx={{ padding: '10px' }} />
            }
          />
          <Autocomplete
            sx={{ width: '50%', mb: 1 }}
            id="subject_selector"
            options={Object.keys(DEPT_COURSES)}
            value={courseSearchData.searchSubject}
            onChange={(_, value) => setCourseSearchTabData('searchSubject', value)}
            renderInput={(params) => 
              <TextField {...params} label="Subject" sx={{ padding: '10px' }} />
            }
          />
          <Autocomplete
            sx={{ width: '50%', mb: 1 }}
            id="course_selector"
            options={courseSearchData.searchSubject 
              ? Object.entries(DEPT_COURSES[courseSearchData.searchSubject as keyof typeof DEPT_COURSES])
                  .map(([code, details]) => `${code} ${(details as unknown as DeptCourse).course_title}`)
              : []
            }
            value={courseSearchData.searchCourse}
            onChange={handleCourseChange}
            renderInput={(params) => 
              <TextField {...params} label="Course" sx={{ padding: '10px' }} />
            }
            disabled={!courseSearchData.searchSubject}
          />
          <Button
            variant='outlined'
            sx={{ width: '50%' }}
            onClick={courseSearch}
            disabled={!courseSearchData.selectedTerm || !courseSearchData.searchSubject || !courseSearchData.selectedCourseInfo || isLoading}
          >
            Search
          </Button>
          {isLoading && <CircularProgressWithLabel value={progress} label={progressLabel} />}
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error: {error.message}
            </Typography>
          )}
        </List>
      </Box>
      <Box sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        mb: 4
      }}>
        
        {courseData?.sections && Object.keys(courseData.sections).length> 0 ? (
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <style>{customStyles}</style>
            <DataTable 
              dataKey="uniqueRowId"
              value={courseData.sections ? Object.values(courseData.sections).sort(sortSections).flatMap((section, index) => {
                // If section has lecture and labs, return the grouped section (for expansion)
                if (section.lecture && section.labs && section.labs.length > 0) {
                  return [{...section, uniqueRowId: `grouped-${section.lecture.section || index}`}];
                }
                // If section has lecture but no labs, return just the lecture
                if (section.lecture && (!section.labs || section.labs.length === 0)) {
                  return [{...section, uniqueRowId: `lecture-only-${section.lecture.section || index}`}];
                }
                // If no lecture but has labs, return individual lab rows
                if (section.labs && section.labs.length > 0) {
                  return section.labs.reduce((acc : (GroupedSections & {uniqueRowId: string})[], lab, labIndex) => {
                    acc.push({labs: null, lecture: lab, uniqueRowId: `lab-only-${lab.section || `${index}-${labIndex}`}`});
                    return acc;
                  }, []);
                }
                // Fallback
                return [];
              }) : []}
              paginator
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rowExpansionTemplate={rowExpansionTemplate}
              rows={100}
              className="custom-datatable"
              rowsPerPageOptions={[10, 25, 50]}
             
            >
              <Column expander={(row) => row.labs && row.labs.length > 0}></Column>
              <Column field="to_cart_button" header="" body={(params : GroupedSections) => params.lecture   && ToCartButtonCell(params.lecture)} />
              <Column field="availability" header="Status" body={(params : GroupedSections) => params.lecture && StatusAndSlotsCell(params.lecture)} />
              <Column field="section" header="Course Info" body={(params : GroupedSections) => params.lecture && CourseInfoCell(params.lecture)} />
              <Column field="instructor_name" header="Instructor" body={(row : GroupedSections) => Array.isArray(row.lecture?.instructor_name) ? row.lecture?.instructor_name.join(', ') : row.lecture?.instructor_name} />

              <Column field="professor_rating" header="Rating" body={(params : GroupedSections) => params.lecture && RateMyProfessorCell(params.lecture)} />
              <Column field="grade_distribution" header="Grades" body={(params : GroupedSections) => params.lecture && GradeDistributionCell(params.lecture)} />
              <Column field="info" header="Info" body={(params : GroupedSections) => params.lecture && InfoCell(params.lecture)} />
            </DataTable>

            
          </Box>
        ) : (
          <Typography variant="body1" sx={{ p: 2 }}>
            {courseData ? 'No sections available' : 'Search for a course to see sections'}
          </Typography>
        )}
      </Box>
    </DialogContent>
   
  );
} 