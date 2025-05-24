import { useEffect } from 'react';
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
import { OpenCourseSectionsColumn, sortSections } from '../../types/DataGridCourse';
import { DataGrid } from '@mui/x-data-grid';
import { useMemoizedSearch } from '../../hooks/useMemoizedSearch';
import type { CourseSearchData } from '../TabDataStore/TabData';

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
          
          // Extract just the catalog number (e.g., "316" from "CSC316")
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

 

  return (
    <DialogContent>
      <Box sx={{ width: '100%', p: 2 }}>
        <List>
          <Autocomplete
            sx={{ width: '50%', mb: 2 }}
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
            sx={{ width: '50%', mb: 2 }}
            id="subject_selector"
            options={Object.keys(DEPT_COURSES)}
            value={courseSearchData.searchSubject}
            onChange={(_, value) => setCourseSearchTabData('searchSubject', value)}
            renderInput={(params) => 
              <TextField {...params} label="Subject" sx={{ padding: '10px' }} />
            }
          />
          <Autocomplete
            sx={{ width: '50%', mb: 2 }}
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
        {courseData?.sections && courseData.sections.length > 0 ? (
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            
            <DataGrid
              getRowId={(row) => row.id || row.classNumber || `${row.section}-${Math.random()}`}
              rows={courseData.sections.sort(sortSections)}
              columns={OpenCourseSectionsColumn}
              columnVisibilityModel={{ id: false }}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
              }}
              sx={{
                width: '100%',
                '& .MuiDataGrid-main': { overflow: 'visible' },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: (theme) => theme.palette.background.paper,
                  minHeight: '64px !important',
                  lineHeight: '24px !important',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 'bold',
                  overflow: 'visible',
                  lineHeight: '1.2 !important',
                  whiteSpace: 'normal',
                  textOverflow: 'clip',
                  fontSize: {
                    xs: '0.75rem',
                    sm: '0.875rem',
                    md: '1rem'
                  }
                },
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal',
                  padding: '8px 16px',
                  fontSize: {
                    xs: '0.75rem',
                    sm: '0.875rem',
                    md: '0.925rem'
                  }
                },
                '& .MuiDataGrid-row': {
                  width: '100%'
                },
                '& .MuiDataGrid-virtualScroller': {
                  width: '100%'
                },
                '& .MuiButtonBase-root': {
                  fontSize: {
                    xs: '0.7rem',
                    sm: '0.8rem',
                    md: '0.875rem'
                  }
                }
              }}
            />
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