import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  DialogContent,
  
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Collapse,
  ButtonBase
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { majorPlans } from '../../Data/PlanSearch/MajorPlans';
import { minorPlans } from '../../Data/PlanSearch/MinorPlans';
import { TermIdByName } from '../../Data/TermID';
import { AppLogger } from '../../utils/logger';
import { OpenCourseSectionsColumn, sortSections } from '../../types/DataGridCourse';
import { fetchCourseSearchData } from '../../services/api';
import type { RequiredCourse, MajorPlan, Subplan } from '../../types/Plans';
import type { MergedCourseData } from '../../utils/CourseSearch/MergeDataUtil';

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

export default function PlanSearch() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const major_options = Object.keys(majorPlans);
  const minor_options = Object.keys(minorPlans);
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedMinor, setSelectedMinor] = useState<string | null>(null);
  const [selectedSubplan, setSelectedSubplan] = useState<string | null>(null);
  const [searchMajor, setSearchMajor] = useState<string | null>(null);
  const [searchSubplan, setSearchSubplan] = useState<string | null>(null);
  const [openCourses, setOpenCourses] = useState<Record<string, MergedCourseData>>({});
  const [isLoaded, setIsLoaded] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState<string>('');

  const subplanOptions = selectedMajor
    ? Object.keys(majorPlans[selectedMajor as keyof typeof majorPlans]?.subplans || {})
    : [];

  const handleClick = (requirementKey: string) => {
    setOpen((prevState) => ({
      ...prevState,
      [requirementKey]: !prevState[requirementKey],
    }));
  };

  const planSearch = async () => {
    setProgress(10); // start
    setProgressLabel('Initializing plan search...');
    setSearchMajor(selectedMajor);
    setSearchSubplan(selectedSubplan);
    setIsLoaded(false);
    AppLogger.info("Search clicked with:", { selectedMajor, selectedSubplan, selectedTerm });
    // Call the async logic
    await fetchOpenCourses(selectedMajor, selectedSubplan, selectedTerm);
    setProgress(100); // done
    setProgressLabel('Complete');
  };

  const fetchOpenCourses = async (major: string | null, subplan: string | null, term: string | null) => {
    setProgress(10);
    setProgressLabel(`Preparing to search for ${major} - ${subplan} courses`);
    AppLogger.info('fetchOpenCourses called with:', { major, subplan, term });
    
    if (major && subplan && term) {
      try {
        setProgress(15);
        setProgressLabel(`Loading ${major} plan data`);
        const major_data = majorPlans[major as keyof typeof majorPlans] as MajorPlan;
        const subplan_data = major_data?.subplans[subplan as keyof typeof major_data.subplans] as Subplan | undefined;

        if (!subplan_data) {
          AppLogger.error("No subplan data found for", subplan);
          setProgressLabel(`Error: No data found for ${subplan}`);
          return;
        }

        const requirements = subplan_data?.requirements ?? {};
        const reqCount = Object.keys(requirements).length;
        setProgressLabel(`Processing ${reqCount} requirements for ${subplan}`);
        AppLogger.info("Requirements:", Object.keys(requirements));
        setProgress(20);

        const newOpenCourses: Record<string, MergedCourseData> = {};
        
        // Pass progress callback with status message support
        const data = await fetchCourseSearchData(
          Object.values(requirements), 
          term,
          (progressVal, statusMessage) => {
            // Scale the progress to fit between 20-90%
            setProgress(20 + Math.round(progressVal * 0.7));
            
            // Update progress label from the status message if provided
            if (statusMessage) {
              setProgressLabel(statusMessage);
            }
          }
        );

        if (!data) {
          AppLogger.error("No data returned from fetchCourseSearchData");
          setProgressLabel(`Error: No course data found for ${major} - ${subplan}`);
          return;
        }

        AppLogger.info("Data returned from API:", data);
        setProgress(90);
        setProgressLabel('Processing course sections');
        
        for (const [courseKey, course] of Object.entries(data)) {
          // Ensure each section has a unique ID
          if (course.sections) {
            course.sections = course.sections.map((section, index) => ({
              ...section,
              id: section.classNumber || `${section.section}-${index}`
            }));
          }
          newOpenCourses[courseKey] = course;
        }
        
        setProgress(95);
        setProgressLabel('Finalizing search results');
        AppLogger.info("Setting openCourses with:", newOpenCourses);
        setIsLoaded(true);
        setOpenCourses(newOpenCourses);
        AppLogger.info('Updated open courses:', newOpenCourses);
      } catch (error) {
        AppLogger.error("Error in fetchOpenCourses:", error);
        setProgressLabel(`Error fetching courses: ${error}`);
      } finally {
        setProgress(100);
        setProgressLabel('Complete');
      }
    }
  };

  // Build requirements list if search was performed
  let requirementsList = null;
  if (searchMajor && searchSubplan) {
    const major_data = majorPlans[searchMajor as keyof typeof majorPlans] as MajorPlan;
    const subplan_data = major_data?.subplans[searchSubplan as keyof typeof major_data.subplans] as Subplan | undefined;
    const requirements = subplan_data?.requirements ?? {};

    if (subplan_data) {
      requirementsList = (
        <List >
          {Object.keys(requirements).map((requirementKey) => (
            <Box
              key={requirementKey}
              sx={(theme) => ({
                border: '2px solid',
                
                borderColor: (theme.vars || theme).palette.divider,
                'background-color': 'none',
                position: 'relative',
                zIndex: 0,
                borderRadius: 2,
                mb: 3,
                
                p: 2,
              })}
            >
              <ListItem sx={{
                'background-color': 'none',
              }}>
                <ButtonBase onClick={() => handleClick(requirementKey)}>
                  <ListItemText 
                    primary={requirementKey} 
                    slotProps={{ primary: { fontWeight: 700, fontSize: '1.2rem' } }} 
                  sx={() => ({
                    'background-color': 'none',
                  })} 
                />
                </ButtonBase>
              </ListItem>
              <Collapse in={open[requirementKey]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ 'background-color': 'none' }}>
                 
                  {requirements[requirementKey].courses.map((course: RequiredCourse) => (
                    <ListItem alignItems="flex-start" key={course.course_abr} sx={{ pl: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <ListItemText
                          primary={`${course.course_descrip} ${course.course_abr} ${parseInt(course.catalog_num)}`}
                          secondary={`${course.course_abr} ${course.catalog_num}`}
                        />
                        <Box sx={{ 
                          width: '100%', 
                          mb: 4
                        }}>
                          {openCourses[`${course.course_abr} ${course.catalog_num}`]?.sections?.length > 0 ? (
                            <Box sx={{ 
                              //height: 400,
                              width: '100%',
                              display: 'flex'
                            }}>
                              <DataGrid
                                getRowId={(row) => row.id || row.classNumber || `${row.section}-${Math.random()}`}
                                rows={openCourses[`${course.course_abr} ${course.catalog_num}`].sections.sort(sortSections)}
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
                              No sections available
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
      );
    }
  }

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
            id="major_selector"
            options={major_options}
            value={selectedMajor}
            onChange={(_, value) => setSelectedMajor(value)}
            renderInput={(params) => 
              <TextField {...params} label="Major" sx={{ padding: '10px' }} />
            }
          />
          
          <Autocomplete
            sx={{ width: '50%', mb: 2 }}
            id="minor_selector"
            options={minor_options}
            value={selectedMinor}
            onChange={(_, value) => setSelectedMinor(value)}
            renderInput={(params) => 
              <TextField {...params} label="Minor" sx={{ padding: '10px' }} />
            }
          />
          
          <Autocomplete
            sx={{ width: '50%', mb: 2 }}
            id="subplan_selector"
            options={subplanOptions}
            value={selectedSubplan}
            onChange={(_, value) => setSelectedSubplan(value)}
            renderInput={(params) => 
              <TextField {...params} label="Subplan" sx={{ padding: '10px' }} />
            }
          />
          
          <Button
            variant='outlined'
            sx={{ width: '50%', mb: 2 }}
            onClick={planSearch}
          >
            Search
          </Button>
          
          {!isLoaded && <CircularProgressWithLabel value={progress} label={progressLabel} />}
          {isLoaded && requirementsList}
        </List>
      </Box>
    </DialogContent>
  );
} 