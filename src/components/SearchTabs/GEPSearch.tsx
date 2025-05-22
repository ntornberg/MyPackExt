import { Box, CircularProgress, ListItem, ListItemText, Typography } from "@mui/material";

import { Button, DialogContent, TextField, List, Autocomplete } from "@mui/material";
import { AppLogger } from "../../utils/logger";
import { useState } from "react";
import { fetchGEPCourseData } from "../../services/api/CourseSearch/dataService";
import { GEP_COURSES } from "../../Data/CourseSearch/gep_courses.typed";
import type { MergedCourseData } from "../../utils/CourseSearch/MergeDataUtil";
import { TermIdByName } from "../../Data/TermID";
import { OpenCourseSectionsColumn } from '../../types/DataGridCourse';
import { DataGrid } from '@mui/x-data-grid';
import type { RequiredCourse } from "../../types/Plans";
import { styled } from '@mui/material/styles';
import { sortSections } from '../../types/DataGridCourse';

// Styled DialogContent with gradient background
const StyledDialogContent = styled(DialogContent)(({ theme }) => ({

  backgroundColor: 'none',
  position: 'relative',
  overflow: 'auto',
  '& .MuiAutocomplete-popper': {
    '& .MuiAutocomplete-listbox': {
      '& .MuiAutocomplete-option': {
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-child': {
          borderBottom: 'none'
        }
      }
    }
  }
}));

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

export default function GEPSearch() {
    const [selectedTerm, setSelectedTerm] = useState<string | null>(Object.keys(TermIdByName)[0]);
    const [searchSubject, setSearchSubject] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(true);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState<string>('');
    const [courseData, setCourseData] = useState<Record<string, MergedCourseData> | null>(null);
    const [courses, setCourses] = useState<RequiredCourse[]>([]);
    const courseSearch = async () => {
      setProgress(10);
      setProgressLabel('Initializing GEP course search...');
      setIsLoaded(false);
      AppLogger.info("Course search clicked with:", { selectedTerm, searchSubject });
      
      try {
        if (searchSubject && selectedTerm) {
          const courseInfo = (GEP_COURSES as any)[searchSubject];
          if(courseInfo) {
            const courses = Object.entries(courseInfo).map(([course_title, course_info]) => {
              const title = course_title as string;
              const course_entry = course_info as {course_title: string, course_id: string};
              return {
                course_id: course_entry.course_id,
                course_abr: title.split('-')[0],
                catalog_num: title.split('-')[1],
                course_descrip: course_entry.course_title,
                term: selectedTerm
              };
            });
            
            setCourses(courses);
            setProgressLabel(`Processing ${courses.length} GEP courses for ${searchSubject}`);
            
            // Use the progress callback with status message
            const courseData = await fetchGEPCourseData(
              courses, 
              selectedTerm, 
              (progressValue, statusMessage) => {
                // Update progress state
                setProgress(progressValue);
                
                // Update the progress label if status message is provided
                if (statusMessage) {
                  setProgressLabel(statusMessage);
                }
              }
            );
            
            setCourseData(courseData);
          }
        }
      } catch (error) {
        AppLogger.error("Error fetching course data:", error);
        setProgressLabel('Error fetching GEP course data');
      } finally {
        setProgress(100);
        setProgressLabel('Complete');
        setIsLoaded(true);
      }
    };

  
    return (
      <StyledDialogContent>
        <Box sx={{ width: '100%', p: 2 }}>
          <List>
            <Autocomplete
              sx={{ width: '50%', mb: 2 }}
              id="term_selector"
              options={Object.keys(TermIdByName)}
              value={selectedTerm}
              defaultValue={TermIdByName[Object.keys(TermIdByName)[0]]}
              onChange={(_, value) => setSelectedTerm(value)}
              renderInput={(params) => 
                <TextField {...params} label="Term" sx={{ padding: '10px' }} />
              }
            />
            <Autocomplete
              sx={{ width: '50%', mb: 2 }}
              id="subject_selector"
              options={Object.keys(GEP_COURSES)}
              value={searchSubject}
              onChange={(_, value) => setSearchSubject(value)}
              renderInput={(params) => 
                <TextField {...params} label="Subject" sx={{ padding: '10px' }} />
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
          </List>
        </Box>
      <List>
            {(isLoaded && courses) && courses.map((course : RequiredCourse) => (
                <ListItem alignItems="flex-start" key={course.course_abr} sx={{ pl: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <ListItemText
                        primary={`${course.course_descrip} ${course.course_abr} ${parseInt(course.catalog_num)}`}
                        secondary={`${course.course_abr} ${course.catalog_num}`}
                    />
          {courseData && courseData[`${course.course_abr} ${course.catalog_num}`]?.sections.length > 0 ? (
            <Box sx={{ 
              //height: 400,
              width: '100%',
              display: 'flex'
            }}>
              <DataGrid
                getRowId={(row) => row.id || row.classNumber || `${row.section}-${Math.random()}`}
                rows={courseData[`${course.course_abr} ${course.catalog_num}`].sections.sort(sortSections)}
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
                    },
                    '& .MuiSvgIcon-root' :{
                        color: 'none'
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
        </ListItem>
       
        ))}
        </List>
      </StyledDialogContent>
     
    );
  }
