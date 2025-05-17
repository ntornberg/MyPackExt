import React, { useState } from 'react';
import * as cheerio from 'cheerio';
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
import type { Course, MajorPlans } from '../types/Plans';
import { TermIdByName } from '../Data/TermID';
import { AppLogger } from '../utils/logger';

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

    const subplanOptions = selectedMajor
        ? Object.keys(majorPlans[selectedMajor]?.subplans || {})
        : [];
        interface CourseSection {
            section: string;
            component: string;
            classNumber: string;
            availability: string;
            enrollment: string;
            dayTime: string;
            location: string;
            instructor: {
              name: string;
              link: string | null;
            };
            dates: string;
            notes: string | null;
            requisites: string | null;
          }
          
          interface CourseData {
            code: string;
            title: string;
            units: string;
            description: string;
            prerequisite: string | null;
            sections: CourseSection[];
          }
    function parseHTMLContent(html: string): CourseData | null {
            const $ = cheerio.load(html);
          
            const $courseSection = $('section.course');
            if ($courseSection.length === 0) {
              console.error("Could not find course section.");
              return null;
            }
          
            const code = $courseSection.find('h1').contents().first().text().trim();
            const title = $courseSection.find('h1 small').text().trim();
            const units = $courseSection.find('h1 .units').text().replace('Units:', '').trim();
            const description = $courseSection.find('p').first().text().trim();
            const prerequisite = $courseSection.find('p').eq(1).text().trim(); // Assuming prerequisite is the second paragraph
          
            const sections: CourseSection[] = [];
          
            // Select all table rows within the section table body, excluding the footer row
            $courseSection.find('table.section-table tbody tr').each((_, element) => {
              const $row = $(element);
              const $cells = $row.find('td');
          
              if ($cells.length >= 8) { // Ensure there are enough cells for required data
                const section = $cells.eq(0).text().trim();
                const component = $cells.eq(1).text().trim();
                const classNumber = $cells.eq(2).text().trim();
          
                const availabilityHtml = $cells.eq(3).html() || '';
                const availabilityMatch = availabilityHtml.match(/<span.*?>(.*?)<\/span>/);
                const availability = availabilityMatch ? availabilityMatch[1].trim() : $cells.eq(3).text().trim();
          
                const enrollmentMatch = $cells.eq(3).text().match(/\d+\/\d+/);
                const enrollment = enrollmentMatch ? enrollmentMatch[0] : '';
          
                // Clean up day/time by removing hidden elements and extra whitespace
                const dayTimeHtml = $cells.eq(4).html() || '';
                const $dayTime = $('<div>').html(dayTimeHtml); // Load HTML into a temporary element
                $dayTime.find('.hidden-xs').remove(); // Remove elements with hidden-xs class
                $dayTime.find('.screen-reader-only-text').remove(); // Remove screen-reader-only-text
                const dayTime = $dayTime.text().replace(/\s+/g, ' ').trim();
          
          
                const location = $cells.eq(5).text().trim();
          
                const $instructorLink = $cells.eq(6).find('a.instructor-link');
                const instructorName = $instructorLink.text().trim();
                const instructorLink = $instructorLink.attr('href') || null;
                const instructor = { name: instructorName, link: instructorLink };
          
                const dates = $cells.eq(7).text().trim();
          
                // Extract Notes and Requisites from popover data-content in the last cell
                const $lastCell = $cells.eq(9); // Index 9 for the last td with class 'screen-only'
          
                const notesLink = $lastCell.find('[data-toggle="popover"][id^="notes-"]');
                const notes = notesLink.attr('data-content') || null;
          
                const requisitesLink = $lastCell.find('[data-toggle="popover"][id^="reqs-"]');
                const requisites = requisitesLink.attr('data-content') || null;
          
          
                sections.push({
                  section,
                  component,
                  classNumber,
                  availability,
                  enrollment,
                  dayTime,
                  location,
                  instructor,
                  dates,
                  notes,
                  requisites,
                });
              }
            });
          
            return {
              code,
              title,
              units,
              description,
              prerequisite,
              sections,
            };
          }
    
    function formCourseURL(term :string, course_abr: string, course_id: string) {
        const formData = new URLSearchParams();
        formData.append("term", term);
        const subject = TermIdByName[course_abr]
        formData.append("subject", subject);
        formData.append("course-inequality", "=");
        const course_number = parseInt(course_id);
        formData.append("course-number", course_number.toString());
        formData.append("course-career", "");
        formData.append("session", "");
        formData.append("start-time-inequality", "<=");
        formData.append("start-time", "");
        formData.append("end-time-inequality", "<=");
        formData.append("end-time", "");
        formData.append("instructor-name", "");
        formData.append("current_strm", term);
        return formData.toString();
    }
    const handleSearch = () => {
        setSearchMajor(selectedMajor);
        //setSearchMinor(selectedMinor);
        setSearchSubplan(selectedSubplan);
        setSearchTerm(selectedTerm);
    };
    const searchOpenCourses = async (term : string,course : Course)  => {
        AppLogger.info('Calling searchOpenCourses', { term, course });
        try {
            const formData = formCourseURL(term, course.course_abr, course.course_id);
            const response = await fetch("https://webappprd.acs.ncsu.edu/php/coursecat/search.php", {
                method: "POST",
                body: formData // Content-Type set automatically
            });
            const text = await response.text();
            AppLogger.info('Received response text', text);
            parseHTMLContent(text);
        } catch (error) {
            AppLogger.error('Error in searchOpenCourses', error);
        }
    }
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
            AppLogger.info('Requirement', { key, requirement: rq });
            for (const course of rq.courses) {
                AppLogger.info('Course in requirement', course);
            }
        }
        for (const [_, rq] of Object.entries(subplan_data.requirements)) {
            for (const course of Object.values(rq.courses)) {
                AppLogger.info('Searching open courses for', { searchTerm, course });
                const response = searchOpenCourses(searchTerm ?? "",course);
                AppLogger.info('searchOpenCourses response (Promise)', response);
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
