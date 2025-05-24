import { Box, CircularProgress, FormControlLabel, ListItem, ListItemText, Typography, Checkbox} from "@mui/material";

import { Button, DialogContent, TextField, List, Autocomplete } from "@mui/material";
import { AppLogger } from "../../utils/logger";
import { useMemo } from "react";
import { fetchGEPCourseData } from "../../services/api/CourseSearch/dataService";
import { GEP_COURSES } from "../../Data/CourseSearch/gep_courses.typed";
import type { MergedCourseData } from "../../utils/CourseSearch/MergeDataUtil";
import { TermIdByName } from "../../Data/TermID";
import { OpenCourseSectionsColumn } from '../../types/DataGridCourse';
import { DataGrid } from '@mui/x-data-grid';
import type { RequiredCourse } from "../../types/Plans";
import { styled } from '@mui/material/styles';
import { sortSections } from '../../types/DataGridCourse';
import { type GEPData } from "../TabDataStore/TabData";
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

export default function GEPSearch({setGepSearchTabData, gepSearchData}: {setGepSearchTabData: (key: keyof GEPData, value: any) => void, gepSearchData: GEPData}) {

    const courseSearch = async () => {
      setGepSearchTabData('progress', 10);
      setGepSearchTabData('progressLabel', 'Initializing GEP course search...');
      setGepSearchTabData('isLoaded', false);
      AppLogger.info("Course search clicked with:", { 
        selectedTerm: gepSearchData.selectedTerm, 
        searchSubject: gepSearchData.searchSubject 
      });
      
      try {
        if (gepSearchData.searchSubject && gepSearchData.selectedTerm) {
          const courseInfo = (GEP_COURSES as any)[gepSearchData.searchSubject];
          if(courseInfo) {
            const courses = Object.entries(courseInfo).map(([course_title, course_info]) => {
              const title = course_title as string;
              const course_entry = course_info as {course_title: string, course_id: string};
              return {
                course_id: course_entry.course_id,
                course_abr: title.split('-')[0],
                catalog_num: title.split('-')[1],
                course_descrip: course_entry.course_title,
                term: gepSearchData.selectedTerm
              };
            });
            
            setGepSearchTabData('courses', courses);
            setGepSearchTabData('progressLabel', `Processing ${courses.length} GEP courses for ${gepSearchData.searchSubject}`);
            
            // Use the progress callback with status message
            const courseData = await fetchGEPCourseData(
              courses, 
              gepSearchData.selectedTerm, 
              (progressValue, statusMessage) => {
                // Update progress state
                setGepSearchTabData('progress', progressValue);
                
                // Update the progress label if status message is provided
                if (statusMessage) {
                  setGepSearchTabData('progressLabel', statusMessage);
                }
              }
            );
            
            // Debug the returned course data
            AppLogger.info("[GEP RENDER DEBUG] Received course data:", courseData);
            
            // Check which courses have sections
            if (courseData) {
              const coursesWithSections = Object.entries(courseData)
                .filter(([_, data]) => data.sections && data.sections.length > 0)
                .map(([key]) => key);
              
              AppLogger.info(`[GEP RENDER DEBUG] Courses with sections (${coursesWithSections.length}): ${coursesWithSections.join(', ')}`);
              
              const coursesWithoutSections = Object.entries(courseData)
                .filter(([_, data]) => !data.sections || data.sections.length === 0)
                .map(([key]) => key);
              
              AppLogger.info(`[GEP RENDER DEBUG] Courses without sections (${coursesWithoutSections.length}): ${coursesWithoutSections.join(', ')}`);
            }
            
            setGepSearchTabData('courseData', courseData);
          }
        }
      } catch (error) {
        AppLogger.error("Error fetching course data:", error);
        setGepSearchTabData('progressLabel', 'Error fetching GEP course data');
      } finally {
        setGepSearchTabData('progress', 100);
        setGepSearchTabData('progressLabel', 'Complete');
        setGepSearchTabData('isLoaded', true);
      }
    };

    // Memoize the filtered courses to prevent recalculation on every render
    const filteredCourses = useMemo(() => {
   
      
      if (!gepSearchData.isLoaded || !gepSearchData.courses) {
        AppLogger.info("[GEP FILTER DEBUG] No courses or not loaded, returning empty array");
        return [];
      }
      
      if (!gepSearchData.hideNoSections || !gepSearchData.courseData) {
        AppLogger.info("[GEP FILTER DEBUG] Not filtering - returning all courses");
        return gepSearchData.courses;
      }
      
      // Apply filtering only when hideNoSections is true
      AppLogger.info("[GEP FILTER DEBUG] Filtering courses");
      
      // Debug each course's section data before filtering
      gepSearchData.courses.forEach(course => {
        const key = `${course.course_abr} ${course.catalog_num}`;
        const data = (gepSearchData.courseData as Record<string, MergedCourseData>)[key];
        AppLogger.info(`[GEP FILTER DEBUG] Course ${key}: has data? ${!!data}, sections? ${data?.sections?.length || 0}`);
      });
      
      // Perform filtering with detailed logging
      const filtered = gepSearchData.courses.filter((course: RequiredCourse) => {
        const key = `${course.course_abr} ${course.catalog_num}`;
        const courseData = (gepSearchData.courseData as Record<string, MergedCourseData>)[key];
        
        // Log detailed information about this course
       
        
        // Only return true if course has data AND has sections with length > 0
        const hasSection = courseData && courseData.sections && courseData.sections.length > 0;
        AppLogger.info(`[GEP FILTER DEBUG] - Will be included: ${hasSection}`);
        
        return hasSection;
      });
      
      // Log the filtering results
      AppLogger.info(`[GEP FILTER DEBUG] Filtered ${gepSearchData.courses.length} courses down to ${filtered.length}`);
      filtered.forEach(course => {
        AppLogger.info(`[GEP FILTER DEBUG] Included course: ${course.course_abr} ${course.catalog_num}`);
      });
      
      return filtered;
    }, [gepSearchData.courses, gepSearchData.hideNoSections, gepSearchData.courseData, gepSearchData.isLoaded]);
    AppLogger.info("Filtered courses");
    AppLogger.info(filteredCourses);
    return (
      <StyledDialogContent>
        <Box sx={{ width: '100%', p: 2 }}>
          <List>
            <Autocomplete
              sx={{ width: '50%', mb: 2 }}
              id="term_selector"
              options={Object.keys(TermIdByName)}
              value={gepSearchData.selectedTerm}
              defaultValue={TermIdByName[Object.keys(TermIdByName)[0]]}
              onChange={(_, value) => setGepSearchTabData('selectedTerm', value)}
              renderInput={(params) => 
                <TextField {...params} label="Term" sx={{ padding: '10px' }} />
              }
            />
            <Autocomplete
              sx={{ width: '50%', mb: 2 }}
              id="subject_selector"
              options={Object.keys(GEP_COURSES)}
              value={gepSearchData.searchSubject}
              onChange={(_, value) => setGepSearchTabData('searchSubject', value)}
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
            <FormControlLabel
            control={<Checkbox checked={gepSearchData.hideNoSections} onChange={(_, checked) => setGepSearchTabData('hideNoSections', checked)} />}
            label="Hide courses with no open sections"
          />
            {!gepSearchData.isLoaded && <CircularProgressWithLabel value={gepSearchData.progress} label={gepSearchData.progressLabel || ''} />}
          </List>
        </Box>
        {gepSearchData.isLoaded && filteredCourses.length === 0 && (
          <Typography variant="body1" sx={{ p: 4, textAlign: 'center' }}>
            No courses with open sections found. {gepSearchData.hideNoSections && "Try unchecking 'Hide courses with no open sections'."}
          </Typography>
        )}
        
        {/* Add key to force re-rendering when hideNoSections changes */}
        
        <List 
          key={`course-list-${gepSearchData.hideNoSections ? 'filtered' : 'all'}`}
        >
        
            {filteredCourses.map((course : RequiredCourse) => {
                const key = `${course.course_abr} ${course.catalog_num}`;
                const courseData = gepSearchData.courseData as Record<string, MergedCourseData>;
                const hasSections = courseData[key]?.sections?.length > 0;
                
                return (
                  <ListItem alignItems="flex-start" key={course.course_abr} sx={{ pl: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <ListItemText
                        primary={`${course.course_descrip} ${course.course_abr} ${parseInt(course.catalog_num)}`}
                        secondary={`${course.course_abr} ${course.catalog_num}`}
                      />
                      {hasSections ? (
                        <Box sx={{ 
                          height: '100%',
                          minHeight: 300,
                          width: '100%',
                          display: 'flex'
                        }}>
                          <DataGrid
                            getRowId={(row) => row.id || row.classNumber || `${row.section}-${Math.random()}`}
                            rows={courseData[key].sections.sort(sortSections)}
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
                          {gepSearchData.courseData ? 'No sections available' : 'Search for a course to see sections'}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                );
              })}
        </List>
      </StyledDialogContent>
     
    );
  }
