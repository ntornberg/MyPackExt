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
import { TermIdByName } from '../Data/TermID';
import { DEPT_COURSES } from '../Data/CourseSearch/department_courses.typed';
import { AppLogger } from '../utils/logger';
import { fetchSingleCourseData } from '../services/api/CourseSearch/dataService';
import type { MergedCourseData } from '../utils/CourseSearch/MergeDataUtil';
import { OpenCourseSectionsColumn } from '../types/DataGridCourse';
import { DataGrid } from '@mui/x-data-grid';

export function CircularProgressWithLabel({ value }: { value: number }) {
  return (
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
  );
}

export default function CourseSearch() {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [searchSubject, setSearchSubject] = useState<string | null>(null);
  const [searchCourse, setSearchCourse] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [progress, setProgress] = useState(0);
  const [courseData, setCourseData] = useState<MergedCourseData | null>(null);
  const courseSearch = async () => {
    setProgress(10);
    setIsLoaded(false);
    AppLogger.info("Course search clicked with:", { selectedTerm, searchSubject, searchCourse });
    // Implement course search logic here
    // Mock progress updates
    if (searchSubject && searchCourse && selectedTerm) {
      const courseInfo = (DEPT_COURSES as any)[searchSubject][searchCourse];
      const courseData = await fetchSingleCourseData(
        searchCourse.split('-')[0],
        searchCourse.split('-')[1],
        courseInfo.course_id,
        selectedTerm
      );
      setCourseData(courseData);
    }
      setProgress(100);
      setIsLoaded(true);
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
          {!isLoaded && <CircularProgressWithLabel value={progress} />}
          {/* Course search results would go here */}
        </List>
      </Box>
      <div style={{ width: '100%', height: '400px', overflow: 'visible' }}>
                            {courseData?.sections && (
                              <div style={{ height: 'auto', width: '100%', display: 'flex' }}>
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
                                    height: '100%',
                                    '.MuiDataGrid-main': { overflow: 'visible' },
                                    flex: 1
                                  }}
                                />
                              </div>
                            )}
                            {courseData?.sections && (
                              <div>No sections available</div>
                            )}
                          </div>
    </DialogContent>
   
  );
} 