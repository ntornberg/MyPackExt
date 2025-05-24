import { type PlanSearchData } from '../TabDataStore/TabData';
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
  ButtonBase,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { majorPlans } from '../../Data/PlanSearch/MajorPlans';
import { minorPlans } from '../../Data/PlanSearch/MinorPlans';
import { TermIdByName } from '../../Data/TermID';
import { AppLogger } from '../../utils/logger';
import { OpenCourseSectionsColumn, sortSections } from '../../types/DataGridCourse';
import { fetchCourseSearchData } from '../../services/api';
import type { RequiredCourse, MajorPlan, Subplan, MinorPlan } from '../../types/Plans';
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

export default function PlanSearch({setPlanSearchTabData, planSearchData}: {setPlanSearchTabData: (key: keyof PlanSearchData, value: any) => void, planSearchData: PlanSearchData}) {
 
  const major_options = Object.keys(majorPlans);
  const minor_options = Object.keys(minorPlans);
 


  const subplanOptions = planSearchData.selectedMajor
    ? Object.keys(majorPlans[planSearchData.selectedMajor as keyof typeof majorPlans]?.subplans || {})
    : [];

  const handleClick = (requirementKey: string) => {
    AppLogger.info("Requirement clicked:", { requirementKey });
    AppLogger.info("Open state:", planSearchData.open);
    setPlanSearchTabData('open', requirementKey);
  };

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
          if (course.sections) {
            course.sections = course.sections.map((section, index) => ({
              ...section,
              id: section.classNumber || `${section.section}-${index}`
            }));
          }
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
    const requirements = { ...minor_requirements, ...major_requirements };
    if (Object.keys(requirements).length > 0) {
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
              <Collapse in={planSearchData.open[requirementKey as keyof Record<string, boolean>]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ 'background-color': 'none' }}>
                 
                  {requirements[requirementKey].courses.filter((course: RequiredCourse) => {
                    if (planSearchData.hideNoSections) {
                      return (planSearchData.openCourses as Record<string, MergedCourseData>)[`${course.course_abr} ${course.catalog_num}`]?.sections?.length > 0;
                    }
                    return true;
                  }).map((course: RequiredCourse) => (
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
                          {(planSearchData.openCourses as Record<string, MergedCourseData>)[`${course.course_abr} ${course.catalog_num}`]?.sections?.length > 0 ? (
                            <Box sx={{ 
                              //height: 400,
                              width: '100%',
                              display: 'flex'
                            }}>
                              <DataGrid
                                getRowId={(row) => row.id || row.classNumber || `${row.section}-${Math.random()}`}
                                rows={(planSearchData.openCourses as Record<string, MergedCourseData>)[`${course.course_abr} ${course.catalog_num}`].sections.sort(sortSections)}
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
            value={planSearchData.selectedTerm}
            onChange={(_, value) => setPlanSearchTabData('selectedTerm', value)}
            renderInput={(params) => 
              <TextField {...params} label="Term" sx={{ padding: '10px' }} />
            }
          />
          
          <Autocomplete
            sx={{ width: '50%', mb: 2 }}
            id="major_selector"
            options={major_options}
            value={planSearchData.selectedMajor}
            onChange={(_, value) => setPlanSearchTabData('selectedMajor', value)}
            renderInput={(params) => 
              <TextField {...params} label="Major" sx={{ padding: '10px' }} />
            }
          />
          
          <Autocomplete
            sx={{ width: '50%', mb: 2 }}
            id="minor_selector"
            options={minor_options}
            value={planSearchData.selectedMinor}
            onChange={(_, value) => setPlanSearchTabData('selectedMinor', value)}
            renderInput={(params) => 
              <TextField {...params} label="Minor" sx={{ padding: '10px' }} />
            }
          />
          
          <Autocomplete
            sx={{ width: '50%', mb: 2 }}
            id="subplan_selector"
            options={subplanOptions}
            value={planSearchData.selectedSubplan}
            onChange={(_, value) => setPlanSearchTabData('selectedSubplan', value)}
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
          <FormControlLabel
            control={<Checkbox checked={planSearchData.hideNoSections} onChange={(_, checked) => setPlanSearchTabData('hideNoSections', checked)} />}
            label="Hide courses with no open sections"
          />
          {!planSearchData.isLoaded && <CircularProgressWithLabel value={planSearchData.progress} label={planSearchData.progressLabel || ''} />}
          {planSearchData.isLoaded && requirementsList}
        </List>
      </Box>
    </DialogContent>
  );
} 