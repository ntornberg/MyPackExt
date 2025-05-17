// Utility functions and types for course parsing and URL formation
import * as cheerio from 'cheerio';
import { TermIdByName } from '../Data/TermID';
import { SubjectMenuValues } from '../Data/SubjectSearchValues';
import { AppLogger } from '../utils/logger';
import type { GridColDef } from '@mui/x-data-grid';
export const OpenCourseSectionsColumn: GridColDef[] = [
    { field: 'id', headerName: 'ID', hideable: true },
    { field: 'section', headerName: 'Section', width: 150 },
    { field: 'component', headerName: 'Component', width: 150 },
    { field: 'classNumber', headerName: 'Class Number', width: 150 },
    { field: 'availability', headerName: 'Availability', width: 150 },
    { field: 'enrollment', headerName: 'Enrollment', width: 150 },
    { field: 'dayTime', headerName: 'Day Time', width: 150 },
    { field: 'location', headerName: 'Location', width: 150 },
    { field: 'instructor', headerName: 'Instructor', width: 150 },
    { field: 'dates', headerName: 'Dates', width: 150 },
    { field: 'notes', headerName: 'Notes', width: 150 },
    { field: 'requisites', headerName: 'Requisites', width: 150 },
  ];
export interface CourseSection {
    id: string;
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

export interface CourseData {
    code: string;
    title: string;
    units: string;
    description: string;
    prerequisite: string | null;
    sections: CourseSection[];
}

export function parseHTMLContent(html: string): CourseData | null {
    const parsed = JSON.parse(html);
    const html_parse = parsed.html
    const $ = cheerio.load(html_parse);
    const $courseSection = $('.course');
    if ($courseSection.length === 0) {
      console.error("Could not find course section.");
      return null;
    }
    const code = $courseSection.find('h1').contents().first().text().trim();
    const title = $courseSection.find('h1 small').text().trim();
    const units = $courseSection.find('h1 .units').text().replace('Units:', '').trim();
    const description = $courseSection.find('p').first().text().trim();
    const prerequisite = $courseSection.find('p').eq(1).text().trim();
    const sections: CourseSection[] = [];
    $courseSection.find('table.section-table tbody tr').each((_, element) => {
      const $row = $(element);
      const $cells = $row.find('td');
      if ($cells.length >= 8) {
        const section = $cells.eq(0).text().trim();
        const component = $cells.eq(1).text().trim();
        const classNumber = $cells.eq(2).text().trim();
        const availabilityHtml = $cells.eq(3).html() || '';
        const availabilityMatch = availabilityHtml.match(/<span.*?>(.*?)<\/span>/);
        const availability = availabilityMatch ? availabilityMatch[1].trim() : $cells.eq(3).text().trim();
        const enrollmentMatch = $cells.eq(3).text().match(/\d+\/\d+/);
        const enrollment = enrollmentMatch ? enrollmentMatch[0] : '';
        const dayTimeHtml = $cells.eq(4).html() || '';
        const $dayTime = $('<div>').html(dayTimeHtml);
        $dayTime.find('.hidden-xs').remove();
        $dayTime.find('.screen-reader-only-text').remove();
        const dayTime = $dayTime.text().replace(/\s+/g, ' ').trim();
        const location = $cells.eq(5).text().trim();
        const $instructorLink = $cells.eq(6).find('a.instructor-link');
        const instructorName = $instructorLink.text().trim();
        const instructorLink = $instructorLink.attr('href') || null;
        const instructor = { name: instructorName, link: instructorLink };
        const dates = $cells.eq(7).text().trim();
        const $lastCell = $cells.eq(9);
        const notesLink = $lastCell.find('[data-toggle="popover"][id^="notes-"]');
        const notes = notesLink.attr('data-content') || null;
        const requisitesLink = $lastCell.find('[data-toggle="popover"][id^="reqs-"]');
        const requisites = requisitesLink.attr('data-content') || null;
        AppLogger.info('Course section', { section, component, classNumber, availability, enrollment, dayTime, location, instructor, dates, notes, requisites });
        sections.push({
          id: `${code}-${section}`,
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

export function formCourseURL(term: string, course_abr: string, course_id: string) {
    const term_id = TermIdByName[term];
    const subject = SubjectMenuValues[course_abr];
    AppLogger.info('Looking up subject', { course_abr, subject });
    if (!subject) {
        AppLogger.error('No subject found for course_abr', { course_abr });
        return null;
    }
    const formData = new URLSearchParams();
    formData.append("term", term_id);
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