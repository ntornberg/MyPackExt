// Utility functions and types for course parsing and URL formation
import type { CheerioAPI } from "cheerio";
import * as cheerio from "cheerio";
import type { Element as DomHandlerElement, Text } from "domhandler";

import { TermIdByName } from "../../../degree-planning/DialogAutoCompleteKeys/TermID.ts";
import { AppLogger } from "../logger";

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

/**
 * Parses a single course HTMLElement from the registrar HTML into structured CourseData.
 *
 * @param {CheerioAPI} $ Cheerio instance bound to the HTML
 * @param {cheerio.Cheerio<DomHandlerElement>} courseSection The root element for a course block
 * @returns {CourseData} Parsed course data
 */
function ParseCourseElement(
  $: CheerioAPI,
  courseSection: cheerio.Cheerio<DomHandlerElement>,
): CourseData {
  const code = courseSection.find("h1").contents().first().text().trim();
  const title = courseSection.find("h1 small").text().trim();
  const units = courseSection
    .find("h1 .units")
    .text()
    .replace("Units:", "")
    .trim();
  const description = courseSection.find("p").first().text().trim();
  const prerequisite = courseSection.find("p").eq(1).text().trim();
  const sections: CourseSection[] = [];
  courseSection.find("table.section-table tbody tr").each((_, element) => {
    const $row = $(element);
    const $cells = $row.find("td");
    if ($cells.length >= 8) {
      const section = $cells.eq(0).text().trim();
      const component = $cells.eq(1).text().trim();
      const classNumber = $cells.eq(2).text().trim();
      const availabilityHtml = $cells.eq(3).html() || "";
      const availabilityMatch = availabilityHtml.match(
        /<span.*?>(.*?)<\/span>/,
      );
      const availability = availabilityMatch
        ? availabilityMatch[1].trim()
        : $cells.eq(3).text().trim();
      const enrollmentMatch = $cells
        .eq(3)
        .text()
        .match(/\d+\/\d+/);
      const enrollment = enrollmentMatch ? enrollmentMatch[0] : "";
      const dayTimeHtml = $cells.eq(4).html() || "";
      const $dayTime = $("<div>").html(dayTimeHtml);
      $dayTime.find(".hidden-xs").remove();
      $dayTime.find(".screen-reader-only-text").remove();
      const dayTime = $dayTime.text().replace(/\s+/g, " ").trim();
      const location = $cells.eq(5).text().trim();
      const $instructorLink = $cells.eq(6).find("a.instructor-link");
      const ins_list = [];
      for (let i = 0; i < $instructorLink.length; i++) {
        if ($instructorLink[i].children[0].type === "text") {
          const ins_name = ($instructorLink[i].children[0] as Text).data;
          ins_list.push(ins_name);
        }
      }

      const dates = $cells.eq(7).text().trim();
      const $lastCell = $cells.eq(9);
      const notesLink = $lastCell.find('[data-toggle="popover"][id^="notes-"]');
      const notes = notesLink.attr("data-content") || null;
      const requisitesLink = $lastCell.find(
        '[data-toggle="popover"][id^="reqs-"]',
      );
      const requisites = requisitesLink.attr("data-content") || null;
      let notes_clean = notes ? notes.replace(/^<p>/, "") : null;
      const requisites_clean = requisites
        ? requisites.replace(/^\s*<p>|<\/p>$/g, "")
        : null;
      notes_clean = notes_clean
        ? notes_clean.replace(/^\s*<br>|<\/br>$/g, "")
        : null;
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
        notes: notes_clean,
        requisites: requisites_clean,
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
/**
 * Parses registrar HTML response payload into CourseData or array of CourseData.
 * Returns null when no course blocks were found.
 *
 * @param {any} html JSON response with an `html` string field
 * @returns {CourseData | CourseData[] | null} Parsed result or null
 */
export function parseHTMLContent(html: any): CourseData | CourseData[] | null {
  const parsed = JSON.parse(html.data);

  const html_parse = parsed.html;
  const $ = cheerio.load(html_parse);
  const $courseSection = $(".course");
  if ($courseSection.length === 0) {
    return null;
  }

  if ($courseSection.length > 1) {
    const courseDataArray: CourseData[] = [];
    $courseSection.each((_, element) => {
      const ele = $(element);
      courseDataArray.push(ParseCourseElement($, ele));
      return true;
    });

    return courseDataArray;
  } else {
    return ParseCourseElement($, $courseSection);
  }
}

/**
 * Forms URL-encoded body for the registrar search based on term, subject, and optional course number.
 *
 * @param {string} term Academic term (display string)
 * @param {string} course_abr Subject code (e.g., "CSC")
 * @param {string | null} [catalog_num] Optional course number
 * @returns {string | null} URL-encoded form body or null when subject missing
 */
export function formCourseURL(
  term: string,
  course_abr: string,
  catalog_num?: string | null,
) {
  const term_id = TermIdByName[term];

  AppLogger.info("Looking up subject", { course_abr }, catalog_num);
  if (!course_abr) {
    AppLogger.error("No subject found for course_abr", { course_abr });
    return null;
  }
  const formData = new URLSearchParams();
  formData.append("term", term_id);
  formData.append("subject", course_abr);
  const inequality = catalog_num ? "=" : ">=";
  formData.append("course-inequality", inequality);
  const course_number = catalog_num ? parseInt(catalog_num!).toString() : "0";
  formData.append("course-number", course_number);
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
