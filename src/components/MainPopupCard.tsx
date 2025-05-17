import React, { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Collapse,
    TextField,
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
    const [searchTerm, setSearchTerm] = useState<string | null>(null);
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
        if (major && subplan && term) {
            const major_data = majorPlans[major as keyof typeof majorPlans] as MajorPlan;
            const subplan_data = major_data?.subplans[subplan as keyof typeof major_data.subplans] as Subplan | undefined;
            const requirements = subplan_data?.requirements ?? {};
            const newOpenCourses: Record<string, any> = {};

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
                                        <ListItem key={course.course_abr} sx={{ pl: 4 }}>
                                            <ListItemText
                                                primary={`${course.course_descrip} ${course.course_abr} ${parseInt(course.catalog_num)}`}
                                                secondary={`${course.course_abr} ${course.catalog_num}`}
                                            />
                                            <DataGrid rows={openCourses[`${course.course_abr}-${course.catalog_num}`].sections} columns={OpenCourseSectionsColumn} columnVisibilityModel={{
                                                id: false,
                                            }} />
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
        <Box sx={{ p: 2 }}>

            <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>

            <Drawer anchor='right' open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 250, p: 2 }}>
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
            </Drawer>
        </Box>
    );
}
