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
import type { RequiredCourse, MajorPlan, Subplan } from '../types/Plans';
import { TermIdByName } from '../Data/TermID';
import { AppLogger } from '../utils/logger';
import { OpenCourseSectionsColumn } from '../types/DataGridCourse'; 
import AppTheme from '../themes/AppTheme';
import { CacheProvider } from '@emotion/react';
// Import your createEmotionCache function
import { createEmotionCache } from '../content';
import { fetchCourseSearchData } from '../services/api';
import type { MergedCourseData } from '../utils/CourseSearch/MergeDataUtil';
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
    const [openCourses, setOpenCourses] = useState<Record<string, MergedCourseData>>({});

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
            const newOpenCourses: Record<string, MergedCourseData> = { ...openCourses };
            const data = await fetchCourseSearchData(Object.values(requirements), term);
            if (!data) {
                return;
            }
            for (const [courseKey, course] of Object.entries(data)) {
                newOpenCourses[courseKey] = course;
            }
        
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
                                    {requirements[requirementKey].courses.map((course: RequiredCourse) => (
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

                <Button onClick={() => setDrawerOpen(true)}>Course Search</Button>

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
