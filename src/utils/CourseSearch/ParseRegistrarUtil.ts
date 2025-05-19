// Utility functions and types for course parsing and URL formation
import * as cheerio from 'cheerio';
import { TermIdByName } from '../../Data/TermID';
import { SubjectMenuValues } from '../../Data/SubjectSearchValues';
import { AppLogger } from '../logger';

export interface CourseSection {
    id: string;
    section: string;
    component: string;
    classNumber: string;
    availability: string;
    enrollment: string;
    dayTime: string;
    location: string;
    instructor_name: string[];
    
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

parseHTMLContent(`{"html":"<section class=\\"course\\" id=\\"AGI-101\\"><h1>AGI 101  <small>Introduction to the Agricultural Institute<\\/small> <span class=\\"units pull-right\\">Units: 1<\\/span><\\/h1><p>Introduction to the collegiate experience; academic skills of successful students; curricula of the Agricultural Institute; career opportunities of graduates; introduction to computers.<\\/p><p>Requisite: Agricultural Institute Only<\\/p><table class=\\"table section-table table-striped table-condensed\\" summary=\\"This table details the sections of AGI 101 based on the criteria submitted in the search form.\\"><thead><tr><th scope=\\"col\\">Sec<span class=\\"hidden-xs\\">tion<\\/span><\\/th><th scope=\\"col\\">Comp<span class=\\"hidden-xs\\">onent<\\/span><\\/th><th scope=\\"col\\" class=\\"class-num hidden-xs\\">Class #<\\/th><th scope=\\"col\\">Avail.<\\/th><th scope=\\"col\\">Day\\/Time<\\/th><th scope=\\"col\\">Loc<span class=\\"hidden-xs\\">ation<\\/span><\\/th><th scope=\\"col\\">Instructor<\\/th><th scope=\\"col\\"><span class=\\"hidden-xs\\">Begin\\/End<\\/span> Dates<\\/th><th scope=\\"col\\" class=\\"hidden-xs\\">Topic<\\/th><th scope=\\"col\\" class=\\"screen-only\\">Notes<\\/th><\\/tr><\\/thead><tfoot><tr><td colspan=\\"6\\"><a href=\\"#container\\">top<\\/a><\\/td><\\/tr><\\/tfoot><tr><td>301<\\/td><td>Lec<\\/td><td class=\\"class-num hidden-xs\\">8527<\\/td><td><span class=\\"text-success\\">Open<\\/span><br \\/>134\\/150<\\/td><td><ul class=\\"weekdisplay\\"><li class=\\"open hidden-xs\\"><abbr title=\\"Sunday\\">S<\\/abbr><\\/li><li class=\\"open hidden-xs\\"><abbr title=\\"Monday\\">M<\\/abbr><\\/li><li class=\\"open hidden-xs\\"><abbr title=\\"Tuesday\\">T<\\/abbr><\\/li><li class=\\"open hidden-xs\\"><abbr title=\\"Wednesday\\">W<\\/abbr><\\/li><li class=\\"open hidden-xs\\"><abbr title=\\"Thursday\\">T<\\/abbr><\\/li><li class=\\"meet hidden-xs\\"><abbr title=\\"Friday - meet\\">F<\\/abbr><span class=\\"screen-reader-only-text\\"> meets<\\/span><\\/li><span class=\\"visible-xs print-only\\">F <\\/span><li class=\\"open hidden-xs\\"><abbr title=\\"Saturday\\">S<\\/abbr><\\/li><\\/ul> 11:45 AM  - 12:35 PM <br \\/><ul class=\\"weekdisplay\\"><li class=\\"open hidden-xs\\"><abbr title=\\"Sunday\\">S<\\/abbr><\\/li><li class=\\"open hidden-xs\\"><abbr title=\\"Monday\\">M<\\/abbr><\\/li><li class=\\"open hidden-xs\\"><abbr title=\\"Tuesday\\">T<\\/abbr><\\/li><li class=\\"open hidden-xs\\"><abbr title=\\"Wednesday\\">W<\\/abbr><\\/li><li class=\\"open hidden-xs\\"><abbr title=\\"Thursday\\">T<\\/abbr><\\/li><li class=\\"meet hidden-xs\\"><abbr title=\\"Friday - meet\\">F<\\/abbr><span class=\\"screen-reader-only-text\\"> meets<\\/span><\\/li><span class=\\"visible-xs print-only\\">F <\\/span><li class=\\"open hidden-xs\\"><abbr title=\\"Saturday\\">S<\\/abbr><\\/li><\\/ul> 11:45 AM  - 12:35 PM <\\/td><td>232A Withers Hall<br \\/>Hybrid - Online and In-Person<\\/td><td><a href=\\"http:\\/\\/directory.ncsu.edu\\/users\\/rlivy\\" class=\\"instructor-link\\" target=\\"_blank\\">Ivy III,Lee<\\/a><br \\/><a href=\\"http:\\/\\/directory.ncsu.edu\\/users\\/kcbettin\\" class=\\"instructor-link\\" target=\\"_blank\\">Howell,Kayla Bettinger<\\/a><br \\/><a href=\\"http:\\/\\/directory.ncsu.edu\\/users\\/kcbettin\\" class=\\"instructor-link\\" target=\\"_blank\\">Howell,Kayla Bettinger<\\/a><br \\/><a href=\\"http:\\/\\/directory.ncsu.edu\\/users\\/rlivy\\" class=\\"instructor-link\\" target=\\"_blank\\">Ivy III,Lee<\\/a><\\/td><td>08\\/18\\/25 - 10\\/08\\/25<br \\/><em>Eight Week - First<\\/em><\\/td><td  class=\\"hidden-xs\\"><\\/td><td  class=\\"screen-only\\"><a href='https:\\/\\/shop.ncsu.edu\\/adoption-search' target='_blank'><img src='images\\/books-icon.png' alt='View Books' title='View course books in Bookstore' \\/><\\/a><\\/td>\\n                                <\\/tr><\\/table><\\/section> <!-- section AGI-101 -->","json":{"inputs":{"term":"2258","subject":"AGI - Agricultural Institute","course-inequality":"=","course-number":"101","course-career":"","session":"","start-time-inequality":"<=","start-time":"","end-time-inequality":"<=","end-time":"","instructor-name":"","current_strm":"2025 Fall Term"}}}`)
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
      const ins_list = [];
      for(let i = 0; i < $instructorLink.length; i++) {
        const ins_name = $($instructorLink[i]).text();
        ins_list.push(ins_name)
      }

      const dates = $cells.eq(7).text().trim();
      const $lastCell = $cells.eq(9);
      const notesLink = $lastCell.find('[data-toggle="popover"][id^="notes-"]');
      const notes = notesLink.attr('data-content') || null;
      const requisitesLink = $lastCell.find('[data-toggle="popover"][id^="reqs-"]');
      const requisites = requisitesLink.attr('data-content') || null;
      sections.push({
        id: `${section}-${classNumber}`,
        section,
        component,
        classNumber,
        availability,
        enrollment,
        dayTime,
        location,
        instructor_name: ins_list,
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