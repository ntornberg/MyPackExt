/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  parseHTMLContent,
  formCourseURL,
} from "../../../../utils/course-search/parseRegistrarUtil";
import type { CourseData } from "../../../../utils/course-search/parseRegistrarUtil";
import { AppLogger } from "../../../../utils/logger";

/**
 * Sends a registrar search through the background worker and returns the raw
 * response. Throws on transport or HTTP failures so callers can tell them
 * apart from a search that genuinely found nothing.
 */
function fetchViaBackground(url: string, formData: string): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "fetchData", url, formData },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response == null) {
          reject(new Error("Received null response from background fetch"));
          return;
        }
        if (!response.success || response.error) {
          reject(new Error(`Background fetch failed: ${response.error}`));
          return;
        }
        resolve(response);
      },
    );
  });
}

/**
 * Searches for open course sections based on term and course abbreviation/catalog number
 *
 * @param {string} term The academic term to search in
 * @param {string} courseAbr Course abbreviation (e.g., "CSC")
 * @param {string} catalogNum Catalog number (e.g., "316")
 * @returns {Promise<CourseData | null>} CourseData, or null when the search found no course
 * @throws When the request fails or the response can't be parsed
 */
export async function searchOpenCoursesByParams(
  term: string,
  courseAbr: string,
  catalogNum: string,
): Promise<CourseData | null> {
  AppLogger.info("Searching open courses for", {
    term,
    courseAbr,
    catalogNum,
  });
  const formData = formCourseURL(term, courseAbr, catalogNum);
  if (!formData) {
    throw new Error(
      `Invalid search parameters: ${courseAbr} ${catalogNum} ${term}`,
    );
  }

  const response = await fetchViaBackground(
    "https://webappprd.acs.ncsu.edu/php/coursecat/search.php",
    formData,
  );
  const parsed = parseHTMLContent(response);
  if (Array.isArray(parsed)) {
    return parsed[0] ?? null;
  }
  return parsed;
}

/**
 * Searches every course in a subject for a term.
 *
 * @returns {Promise<CourseData[]>} Courses found (empty when none)
 * @throws When the request fails or the response can't be parsed
 */
export async function batchSearchOpenCourses(
  term: string,
  subject: string,
): Promise<CourseData[]> {
  AppLogger.info("Searching open courses for", { term, subject });
  const formData = formCourseURL(term, subject, null);
  if (!formData) {
    throw new Error(`Invalid search parameters: ${subject} ${term}`);
  }

  const response = await fetchViaBackground(
    "https://cloudflareworker.nicktornberg12.workers.dev/",
    formData,
  );
  const parsed = parseHTMLContent(response);
  if (!parsed) {
    return [];
  }
  return Array.isArray(parsed) ? parsed : [parsed];
}
