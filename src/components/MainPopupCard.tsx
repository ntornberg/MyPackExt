import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';


import {
    FormGroup,
    Box,
    
    Button,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Collapse,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Autocomplete from '@mui/material/Autocomplete';
import { majorPlans } from '../Data/MajorPlans'
import { minorPlans } from '../Data/MinorPlans';
import type { Course, MajorPlan, Subplan, Requirement } from '../types/Plans';
import { TermIdByName } from '../Data/TermID';
import { AppLogger } from '../utils/logger';
import { searchOpenCourses } from '../services/courseService';
import type { CourseData } from '../utils/courseUtils';
import { OpenCourseSectionsColumn } from '../utils/courseUtils';
import { generateCacheKey, getGenericCache, setGenericCache } from '../cache/CourseRetrieval';
import AppTheme from '../themes/AppTheme';
import { CacheProvider } from '@emotion/react';
// Import your createEmotionCache function
import { createEmotionCache } from '../content';
const clientSideEmotionCache = createEmotionCache();
export default function SlideOutDrawer() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [open, setOpen] = useState<Record<string, boolean>>({});
    const major_options = Object.keys(majorPlans);
    const minor_options = Object.keys(minorPlans);
    const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [selectedMinor, setSelectedMinor] = useState<string | null>(null);
    const [selectedSubplan, setSelectedSubplan] = useState<string | null>(null);
    const [searchMajor, setSearchMajor] = useState<string | null>(null);
    const [_, setSearchTerm] = useState<string | null>(null);
    //const [searchMinor, setSearchMinor] = useState<string | null>(null);
    const [searchSubplan, setSearchSubplan] = useState<string | null>(null);
    const [openCourses, setOpenCourses] = useState<Record<string, CourseData>>({});

    const subplanOptions = selectedMajor
        ? Object.keys(majorPlans[selectedMajor as keyof typeof majorPlans]?.subplans || {})
        : [];

    const handleSearch = () => {
        setSearchMajor(selectedMajor);
        //setSearchMinor(selectedMinor);
        setSearchSubplan(selectedSubplan);
        setSearchTerm(selectedTerm);

        // Call the async logic
        fetchOpenCourses(selectedMajor, selectedSubplan, selectedTerm);
    };

    const fetchOpenCourses = async (major: string | null, subplan: string | null, term: string | null) => {
        AppLogger.info('fetchOpenCourses', { major, subplan, term });
        if (major && subplan && term) {
            const major_data = majorPlans[major as keyof typeof majorPlans] as MajorPlan;
            const subplan_data = major_data?.subplans[subplan as keyof typeof major_data.subplans] as Subplan | undefined;
            const requirements = subplan_data?.requirements ?? {};
            const newOpenCourses: Record<string, any> = { ...openCourses };
            for (const rq of Object.values(requirements) as Requirement[]) {
                for (const course of rq.courses as Course[]) {
                    if (!course.course_abr || !course.course_id) continue;
                    const courseKey = `${course.course_abr}-${course.catalog_num}`;
                    // Generate a cache key for this course
                    const cacheKey = await generateCacheKey(courseKey + ' ' + term);
                    // Try to get cached data for this course
                    const cachedCourse = await getGenericCache("openCourses", cacheKey);
                    if (cachedCourse) {
                        newOpenCourses[courseKey] = JSON.parse(cachedCourse.combinedData);
                        continue;
                    }
                    // If not cached, fetch and cache
                    const response = await searchOpenCourses(term ?? "", course);
                    AppLogger.info('searchOpenCourses response (Promise)', response);
                    if (response) {
                        newOpenCourses[courseKey] = response;
                        await setGenericCache("openCourses", cacheKey, JSON.stringify(response));
                    }
                }
            }
            AppLogger.info('newOpenCourses', newOpenCourses);
            setOpenCourses(newOpenCourses);
        }
    };

    const handleClick = (requirementKey: string) => {
        setOpen((prevState) => ({
            ...prevState,
            [requirementKey]: !prevState[requirementKey],
        }));
    };

    let requirementsList = null;
    if (searchMajor && searchSubplan) {
        const major_data = majorPlans[searchMajor as keyof typeof majorPlans] as MajorPlan;
        const subplan_data = major_data?.subplans[selectedSubplan as keyof typeof major_data.subplans] as Subplan | undefined;
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
                                position: 'relative', // Add this to fix z-index issues
                                zIndex: 0, // Reset z-index stacking
                                borderRadius: 2,
                                mb: 3,
                                boxShadow: 2,
                                p: 2,
                            })}
                        >
                            <ListItem component="button" onClick={() => handleClick(requirementKey)}>
                                <ListItemText primary={requirementKey} slotProps={{ primary: { fontWeight: 700, fontSize: '1.2rem' } }} />
                            </ListItem>
                            <Collapse in={open[requirementKey]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListSubheader>Courses</ListSubheader>
                                    {requirements[requirementKey].courses.map((course: Course) => (
                                        <ListItem alignItems="flex-start" key={course.course_abr} sx={{ pl: 4 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

                                                <ListItemText
                                                    primary={`${course.course_descrip} ${course.course_abr} ${parseInt(course.catalog_num)}`}
                                                    secondary={`${course.course_abr} ${course.catalog_num}`}
                                                />
                                                <Box sx={{ maxHeight: 400, mt: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>

                                                    {openCourses[`${course.course_abr}-${course.catalog_num}`]?.sections && (
                                                        <DataGrid

                                                            rows={openCourses[`${course.course_abr}-${course.catalog_num}`].sections}
                                                            columns={OpenCourseSectionsColumn}
                                                            columnVisibilityModel={{ id: false }}
                                                         //   sx={(theme) => ({
                                                         //       display: 'flex',
                                                         //       flexDirection: 'column',
                                                         //       flex: 1,          // let it grow inside its Box
                                                         //       minHeight: 0,     // allow shrinking
//
                                                         //       /** ②  Make the part that holds the rows scroll */
                                                         //       '& .MuiDataGrid-main': {
                                                         //           flex: 1,
                                                         //           overflowY: 'auto',   // <<< THIS is now the scroll container
                                                         //       },
//
                                                         //       /** ③  Stick the header to the top of THAT scroll container */
                                                         //       '& .MuiDataGrid-columnHeaders': {
                                                         //           position: 'sticky',
                                                         //           top: 0,
                                                         //           zIndex: theme.zIndex.appBar,        // so rows can't overlap it
                                                         //           backgroundColor: theme.palette.background.paper,
                                                         //       },
//
                                                         //       /** ④  (Optional) wrap cell text, styling you already had */
                                                         //       '& .MuiDataGrid-cell': {
                                                         //           whiteSpace: 'normal',
                                                         //           wordWrap: 'break-word',
                                                         //           lineHeight: 1.4,
                                                         //           alignItems: 'start',
                                                         //       },
                                                         //   })}
                                                        />
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
        <CacheProvider value={clientSideEmotionCache}>
        <AppTheme>
            <CssBaseline enableColorScheme />
            <Box sx={{ p: 2, pointerEvents: 'auto' }}>

                <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>

                <Dialog fullWidth maxWidth='lg' open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={(theme) => ({
                    '& .MuiDialog-paper': {
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: (theme.vars || theme).palette.divider,
                        backgroundColor: (theme.vars || theme).palette.background.paper,
                    },
                })} slotProps={{
                    backdrop: {
                      style: { pointerEvents: 'auto' }
                    }
                  }}>
                    <DialogTitle>Course Search</DialogTitle>
                    <DialogContent>
                        <Box sx={{ width: '100%', p: 2 }}>
                            
                            <List>

                                <FormGroup>
                                    <FormControlLabel control={<Checkbox defaultChecked />} label="GEP Requirements" />

                                </FormGroup>
                                <Autocomplete
                                    sx={{ width: '50%' }}
                                    id="term_selector"
                                    options={Object.keys(TermIdByName)}
                                    value={selectedTerm}
                                    onChange={(_, value) => setSelectedTerm(value)}
                                    renderInput={(params) => <TextField {...params} label="Term" sx={{
                                        padding: '10px', // control internal spacing
                                    }} />}
                                />
                                <Autocomplete
                                    sx={{ width: '50%' }}
                                    id="major_selector"
                                    options={major_options}
                                    value={selectedMajor}
                                    onChange={(_, value) => setSelectedMajor(value)}
                                    renderInput={(params) => <TextField {...params} label="Major" sx={{
                                        padding: '10px', // control internal spacing
                                    }} />}
                                />
                                <Autocomplete
                                    sx={{ width: '50%' }}
                                    id="minor_selector"
                                    options={minor_options}
                                    value={selectedMinor}
                                    onChange={(_, value) => setSelectedMinor(value)}
                                    renderInput={(params) => <TextField {...params} label="Minor" sx={{
                                        padding: '10px', // control internal spacing
                                    }} />}
                                />
                                <Autocomplete
                                    sx={{ width: '50%' }}
                                    id="subplan_selector"
                                    options={subplanOptions}
                                    value={selectedSubplan}
                                    onChange={(_, value) => setSelectedSubplan(value)}
                                    renderInput={(params) => <TextField  {...params} label="Subplan" sx={{
                                        padding: '10px', // control internal spacing
                                    }} />}
                                />
                                <Button
                                    variant='outlined'
                                    sx={{ width: '50%' }}
                                    onClick={handleSearch}
                                >
                                    Search
                                </Button>
                                {requirementsList}


                            </List>
                            <Button onClick={() => setDrawerOpen(false)}>Close</Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
            
            </AppTheme>
            </CacheProvider>
        
    );
}
