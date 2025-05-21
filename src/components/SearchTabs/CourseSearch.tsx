import { useState } from 'react';
import { 
  Autocomplete, 
  Box, 
  Button, 
  List, 
  TextField,
  DialogContent,
  CircularProgress,
  Typography
} from '@mui/material';
import { TermIdByName } from '../../Data/TermID';
import { DEPT_COURSES } from '../../Data/CourseSearch/department_courses.typed';
import { AppLogger } from '../../utils/logger';
import { fetchSingleCourseData } from '../../services/api/CourseSearch/dataService';
import type { MergedCourseData } from '../../utils/CourseSearch/MergeDataUtil';
import { OpenCourseSectionsColumn } from '../../types/DataGridCourse';
import { DataGrid } from '@mui/x-data-grid';

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

export default function CourseSearch() {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [searchSubject, setSearchSubject] = useState<string | null>(null);
  const [searchCourse, setSearchCourse] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState<string>('');
  const [courseData, setCourseData] = useState<MergedCourseData | null>(null);
  const courseSearch = async () => {
    setProgress(10);
    setProgressLabel('Initializing search...');
    setIsLoaded(false);
    AppLogger.info("Course search clicked with:", { selectedTerm, searchSubject, searchCourse });
    
    try {
      if (searchSubject && searchCourse && selectedTerm) {
        const courseKey = `${searchCourse.split('-')[0]} ${searchCourse.split('-')[1]}`;
        const courseInfo = (DEPT_COURSES as any)[searchSubject][searchCourse];
        setProgress(20);
        setProgressLabel(`Searching for ${courseKey} in ${selectedTerm}`);
        
        const courseData = await fetchSingleCourseData(
          searchCourse.split('-')[0],
          searchCourse.split('-')[1],
          courseInfo.course_id,
          selectedTerm,
          // Pass the progress update callback with message support
          (progressValue, statusMessage) => {
            // Update progress with scaled value (20-95% range)
            setProgress(20 + Math.round(progressValue * 0.75));
            
            // Update label from the status message if provided
            if (statusMessage) {
              setProgressLabel(statusMessage);
            }
          }
        );
        
        setCourseData(courseData);
      }
    } catch (error) {
      AppLogger.error("Error fetching course data:", error);
      setProgressLabel('Error fetching course data');
    } finally {
      setProgress(100);
      setProgressLabel('Complete');
      setIsLoaded(true);
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
            value={selectedTerm}
            onChange={(_, value) => setSelectedTerm(value)}
            renderInput={(params) => 
              <TextField {...params} label="Term" sx={{ padding: '10px' }} />
            }
          />
          <Autocomplete
            sx={{ width: '50%', mb: 2 }}
            id="subject_selector"
            options={Object.keys(DEPT_COURSES)}
            value={searchSubject}
            onChange={(_, value) => setSearchSubject(value)}
            renderInput={(params) => 
              <TextField {...params} label="Subject" sx={{ padding: '10px' }} />
            }
          />
          <Autocomplete
            sx={{ width: '50%', mb: 2 }}
            id="course_selector"
            options={searchSubject 
              ? Object.entries(DEPT_COURSES[searchSubject as keyof typeof DEPT_COURSES])
                  .map(([code, details]) => `${code} ${details.course_title}`)
              : []
            }
            value={searchCourse}
            onChange={(_, value) => setSearchCourse(value?.split(' ')[0] ?? null)}
            renderInput={(params) => 
              <TextField {...params} label="Course" sx={{ padding: '10px' }} />
            }
          />
          <Button
            variant='outlined'
            sx={{ width: '50%' }}
            onClick={courseSearch}
          >
            Search
          </Button>
          {!isLoaded && <CircularProgressWithLabel value={progress} label={progressLabel} />}
          {/* Course search results would go here */}
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
            height: 400,
            width: '100%',
            display: 'flex'
          }}>
            <DataGrid
              getRowId={(row) => row.id || row.classNumber || `${row.section}-${Math.random()}`}
              rows={courseData.sections}
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