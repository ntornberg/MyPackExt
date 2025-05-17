import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
import {
    Box,
    Typography,
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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Autocomplete from '@mui/material/Autocomplete';
import { majorPlans } from '../Data/MajorPlans'
import { minorPlans } from '../Data/MinorPlans';
import Checkbox from '@mui/joy/Checkbox';
import type { Course, MajorPlan, Subplan, Requirement } from '../types/Plans';
import { TermIdByName } from '../Data/TermID';
import { AppLogger } from '../utils/logger';
import { searchOpenCourses } from '../services/courseService';
import type { CourseData } from '../utils/courseUtils';
import { OpenCourseSectionsColumn } from '../utils/courseUtils';
import { generateCacheKey, getGenericCache, setGenericCache } from '../cache/CourseRetrieval';

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
            const newOpenCourses: Record<string, any> = {};
            const cacheKey = await generateCacheKey(major + " " + subplan + " " + term);
            const cachedOpenCourses = await getGenericCache("openCourses", cacheKey);
            if (cachedOpenCourses) {
                setOpenCourses(JSON.parse(cachedOpenCourses.combinedData));
                return;
            }
            for (const rq of Object.values(requirements) as Requirement[]) {
                for (const course of rq.courses as Course[]) {
                    if (!course.course_abr || !course.course_id) continue;
                    const response = await searchOpenCourses(term ?? "", course);
                    AppLogger.info('searchOpenCourses response (Promise)', response);
                    if (response) {
                        newOpenCourses[`${course.course_abr}-${course.catalog_num}`] = response;
                    }
                }
            }
            AppLogger.info('newOpenCourses', newOpenCourses);
           
            setGenericCache("openCourses", cacheKey, JSON.stringify(newOpenCourses));
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
        //for (const [key, rq] of Object.entries(requirements)) {
        //    const requirement = rq as Requirement;
        //    AppLogger.info('Requirement', { key, requirement });
        //    for (const course of requirement.courses as Course[]) {
        //        AppLogger.info('Course in requirement', course);
        //    }
        //}

        if (subplan_data) {
            requirementsList = (
                <List>
                    {Object.keys(requirements).map((requirementKey) => (
                        <React.Fragment key={requirementKey}>
                            <ListItem component="button" onClick={() => handleClick(requirementKey)}>
                                <ListItemText primary={requirementKey} />
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
                                              <Box sx={{ height: 200, mt: 2 }}>
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
                        </React.Fragment>
                    ))}
                </List>
            );
        }
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ p: 2 }}>

            <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>

            <Dialog fullScreen open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <DialogTitle>Course Search</DialogTitle>
            <DialogContent>
                <Box sx={{ width: '100%', p: 2 }}>
                    <Typography variant='h6'>Slide-Out Panel</Typography>
                    <List>

                        <Checkbox label="GEP Requirements" defaultChecked />
                        <Autocomplete
                            id="term_selector"
                            options={Object.keys(TermIdByName)}
                            value={selectedTerm}
                            onChange={(_, value) => setSelectedTerm(value)}
                            renderInput={(params) => <TextField {...params} label="Term" />}
                        />
                        <Autocomplete
                            id="major_selector"
                            options={major_options}
                            value={selectedMajor}
                            onChange={(_, value) => setSelectedMajor(value)}
                            renderInput={(params) => <TextField {...params} label="Major" />}
                        />
                        <Autocomplete
                            id="minor_selector"
                            options={minor_options}
                            value={selectedMinor}
                            onChange={(_, value) => setSelectedMinor(value)}
                            renderInput={(params) => <TextField {...params} label="Minor" />}
                        />
                        <Autocomplete
                            id="subplan_selector"
                            options={subplanOptions}
                            value={selectedSubplan}
                            onChange={(_, value) => setSelectedSubplan(value)}
                            renderInput={(params) => <TextField {...params} label="Subplan" />}
                        />
                        <Button
                            variant='outlined'
                            sx={{ width: '100%' }}
                            onClick={handleSearch}
                        >
                            Search
                        </Button>
                        {requirementsList}

                        <ListItem>
                            <ListItemText primary='Item 1' />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary='Item 2' />
                        </ListItem>
                    </List>
                    <Button onClick={() => setDrawerOpen(false)}>Close</Button>
                </Box>
            </DialogContent>
        </Dialog>
        </Box>
        </ThemeProvider>
    );
}
