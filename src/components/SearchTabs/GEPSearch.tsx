import { Box, CircularProgress, FormControlLabel, ListItem, ListItemText, Typography, Checkbox} from "@mui/material";

import { Button, DialogContent, TextField, List, Autocomplete } from "@mui/material";
import { AppLogger } from "../../utils/logger";
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
      <List>
            {(gepSearchData.isLoaded && gepSearchData.courses) && gepSearchData.courses.filter((course : RequiredCourse) => {
              if (gepSearchData.hideNoSections && gepSearchData.courseData) {
                const key = `${course.course_abr} ${course.catalog_num}`;
                return (gepSearchData.courseData as Record<string, MergedCourseData>)[key]?.sections?.length > 0;
              }
              return true;
            }).map((course : RequiredCourse) => (
                <ListItem alignItems="flex-start" key={course.course_abr} sx={{ pl: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <ListItemText
                        primary={`${course.course_descrip} ${course.course_abr} ${parseInt(course.catalog_num)}`}
                        secondary={`${course.course_abr} ${course.catalog_num}`}
                    />
          {gepSearchData.courseData && (gepSearchData.courseData as Record<string, MergedCourseData>)[`${course.course_abr} ${course.catalog_num}`]?.sections.length > 0 ? (
            <Box sx={{ 
              //height: 400,
              width: '100%',
              display: 'flex'
            }}>
              <DataGrid
                getRowId={(row) => row.id || row.classNumber || `${row.section}-${Math.random()}`}
                rows={(gepSearchData.courseData as Record<string, MergedCourseData>)[`${course.course_abr} ${course.catalog_num}`].sections.sort(sortSections)}
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
       
        ))}
        </List>
      </StyledDialogContent>
     
    );
  }
