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
import Autocomplete from '@mui/material/Autocomplete';
import { majorPlans } from '../Data/MajorPlans'
import { minorPlans } from '../Data/MinorPlans';
import Checkbox from '@mui/joy/Checkbox';
import type { MajorPlans } from '../types/Plans';

export default function SlideOutDrawer() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [open, setOpen] = useState<Record<string, boolean>>({});
    const major_options = Object.keys(majorPlans);
    const minor_options = Object.keys(minorPlans);
    const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
    const [selectedMinor, setSelectedMinor] = useState<string | null>(null);
    const [selectedSubplan, setSelectedSubplan] = useState<string | null>(null);
    const [searchMajor, setSearchMajor] = useState<string | null>(null);
    //const [searchMinor, setSearchMinor] = useState<string | null>(null);
    const [searchSubplan, setSearchSubplan] = useState<string | null>(null);

    const subplanOptions = selectedMajor
        ? Object.keys(majorPlans[selectedMajor]?.subplans || {})
        : [];
    function formCourseURL(course_abr: string, course_id: string) {
        const formData = new URLSearchParams();
        formData.append("2258", "2258");
        formData.append("subject", "CSC - Computer Science");
        formData.append("course-inequality", "=");
        formData.append("course-number", "316");
        formData.append("course-career", "");
        formData.append("session", "");
        formData.append("start-time-inequality", "<=");
        formData.append("start-time", "");
        formData.append("end-time-inequality", "<=");
        formData.append("end-time", "");
        formData.append("instructor-name", "");
        formData.append("current_strm", "2258");
    }
    const handleSearch = () => {
        setSearchMajor(selectedMajor);
        //setSearchMinor(selectedMinor);
        setSearchSubplan(selectedSubplan);
    };

    const handleClick = (requirementKey: string) => {
        setOpen((prevState) => ({
            ...prevState,
            [requirementKey]: !prevState[requirementKey],
        }));
    };

    let requirementsList = null;
    if (searchMajor && searchSubplan) {
        const major_data = majorPlans[searchMajor as keyof MajorPlans];
        const subplan_data = major_data?.subplans[searchSubplan as keyof typeof major_data.subplans];
        for (const [key, rq] of Object.entries(subplan_data.requirements)) {
            console.log(key, rq);
            for (const course of rq.courses) {
                console.log(course);
            }
        }
        if (subplan_data) {
            requirementsList = (
                <List>
                    {Object.keys(subplan_data.requirements).map((requirementKey) => (
                        <React.Fragment key={requirementKey}>
                            <ListItem component="button" onClick={() => handleClick(requirementKey)}>
                                <ListItemText primary={requirementKey} />
                            </ListItem>
                            <Collapse in={open[requirementKey]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListSubheader>Courses</ListSubheader>
                                    {subplan_data.requirements[requirementKey].courses.map((course) => (
                                        <ListItem key={course.course_abr} sx={{ pl: 4 }}>
                                            <ListItemText
                                                primary={`${course.course_descrip} ${course.course_abr} ${parseInt(course.course_id)}` }
                                                secondary={`${course.course_abr} ${course.course_id}`}
                                            />
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
