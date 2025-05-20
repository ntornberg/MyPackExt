import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogContent,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
  Collapse
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { majorPlans } from '../Data/PlanSearch/MajorPlans';
import { minorPlans } from '../Data/PlanSearch/MinorPlans';
import { TermIdByName } from '../Data/TermID';
import { AppLogger } from '../utils/logger';
import { OpenCourseSectionsColumn } from '../types/DataGridCourse';
import { fetchCourseSearchData } from '../services/api';
import type { RequiredCourse, MajorPlan, Subplan } from '../types/Plans';
import type { MergedCourseData } from '../utils/CourseSearch/MergeDataUtil';

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
    setSearchMajor(selectedMajor);
    setSearchSubplan(selectedSubplan);
    setIsLoaded(false);
    AppLogger.info("Search clicked with:", { selectedMajor, selectedSubplan, selectedTerm });
    // Call the async logic
    await fetchOpenCourses(selectedMajor, selectedSubplan, selectedTerm, setProgress);
    setProgress(100); // done
  };

  const fetchOpenCourses = async (major: string | null, subplan: string | null, term: string | null, setProgress: (val: number) => void) => {
    setProgress(30);
    AppLogger.info('fetchOpenCourses called with:', { major, subplan, term });
    
    if (major && subplan && term) {
      try {
        const major_data = majorPlans[major as keyof typeof majorPlans] as MajorPlan;
        const subplan_data = major_data?.subplans[subplan as keyof typeof major_data.subplans] as Subplan | undefined;

        if (!subplan_data) {
          AppLogger.error("No subplan data found for", subplan);
          return;
        }

        const requirements = subplan_data?.requirements ?? {};
        AppLogger.info("Requirements:", Object.keys(requirements));

        const newOpenCourses: Record<string, MergedCourseData> = {};
        const data = await fetchCourseSearchData(Object.values(requirements), term);

        if (!data) {
          AppLogger.error("No data returned from fetchCourseSearchData");
          return;
        }

        AppLogger.info("Data returned from API:", data);
        setProgress(40);
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
        setProgress(60);
        AppLogger.info("Setting openCourses with:", newOpenCourses);
        setIsLoaded(true);
        setOpenCourses(newOpenCourses);
        AppLogger.info('Updated open courses:', newOpenCourses);
      } catch (error) {
        AppLogger.error("Error in fetchOpenCourses:", error);
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
        <List>
          {Object.keys(requirements).map((requirementKey) => (
            <Box
              key={requirementKey}
              sx={(theme) => ({
                border: '2px solid',
                borderColor: (theme.vars || theme).palette.divider,
                backgroundColor: (theme.vars || theme).palette.background.paper,
                position: 'relative',
                zIndex: 0,
                borderRadius: 2,
                mb: 3,
                boxShadow: 2,
                p: 2,
              })}
            >
              <ListItem component="button" onClick={() => handleClick(requirementKey)}>
                <ListItemText 
                  primary={requirementKey} 
                  slotProps={{ primary: { fontWeight: 700, fontSize: '1.2rem' } }} 
                  sx={(theme) => ({
                    backgroundColor: (theme.vars || theme).palette.background.paper,
                  })} 
                />
              </ListItem>
              <Collapse in={open[requirementKey]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListSubheader>Courses</ListSubheader>
                  {requirements[requirementKey].courses.map((course: RequiredCourse) => (
                    <ListItem alignItems="flex-start" key={course.course_abr} sx={{ pl: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <ListItemText
                          primary={`${course.course_descrip} ${course.course_abr} ${parseInt(course.catalog_num)}`}
                          secondary={`${course.course_abr} ${course.catalog_num}`}
                        />
                        <Box sx={{ maxHeight: 400, mt: 2, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                          <div style={{ width: '100%', height: '400px', overflow: 'visible' }}>
                            {openCourses[`${course.course_abr}-${course.catalog_num}`]?.sections && (
                              <div style={{ height: 'auto', width: '100%', display: 'flex' }}>
                                <DataGrid
                                  getRowId={(row) => row.id || row.classNumber || `${row.section}-${Math.random()}`}
                                  rows={openCourses[`${course.course_abr}-${course.catalog_num}`].sections}
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
                            {!openCourses[`${course.course_abr}-${course.catalog_num}`]?.sections && (
                              <div>No sections available</div>
                            )}
                          </div>
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
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label="GEP Requirements" />
          </FormGroup>
          
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
          
          {!isLoaded && <CircularProgressWithLabel value={progress} />}
          {requirementsList}
        </List>
      </Box>
    </DialogContent>
  );
} 