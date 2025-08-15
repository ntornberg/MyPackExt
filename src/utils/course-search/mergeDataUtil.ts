import type { BatchDataRequestResponse, GradeData } from "../../types/api.ts";
import type {
  MergedCourseData,
  ModifiedSection,
} from "../../course-management/types/Section";
import type { RequiredCourse } from "../../degree-planning/types/Plans.ts";
import type { CourseData } from "./parseRegistrarUtil";

import { AppLogger } from "../logger";
import { groupSections } from "./groupSections";

/**
 * Merges open course sections with grade distributions and professor ratings.
 * Also enriches sections with fields required for cart actions and groups lec/lab sections.
 *
 * @param {Record<string, CourseData>} courses Map of course key to parsed registrar data
 * @param {BatchDataRequestResponse} batchData Grade and professor batch results
 * @param {Record<string, RequiredCourse>} [courseInfoMap] Optional map of course key to RequiredCourse to propagate course_id
 * @returns {Record<string, MergedCourseData>} Map of course key to merged and grouped course data
 */
export function mergeData(
  courses: Record<string, CourseData>,
  batchData: BatchDataRequestResponse,
  courseInfoMap?: Record<string, RequiredCourse>, // Map of course keys to RequiredCourse containing course_id
) {
  AppLogger.info("Merging data");
  AppLogger.info("Batch data: ", batchData);
  AppLogger.info("Courses: ", courses);
  AppLogger.info("Course info map: ", courseInfoMap);
  const mergedData: Record<string, MergedCourseData> = {};
  for (const [cacheKey, course] of Object.entries(courses)) {
    // Get the courseKey (e.g., "CSC-316")
    const reqCourse = courseInfoMap?.[cacheKey];
    if (!reqCourse) {
      AppLogger.warn("Required course not found for course: ", course);
      AppLogger.warn("Course key: ", cacheKey);
    }

    const mergedCourse: MergedCourseData = {
      ...course,
      sections: {},
      course_id: reqCourse?.course_id, // Store course_id from RequiredCourse
    };

    // Extract catalog number from course code (e.g., "CSC 316" -> "316")
    const codeParts = course.code.split(" ");
    const catalog_nbr = codeParts.length > 1 ? codeParts[1] : "";
    const modifiedSections: Record<string, ModifiedSection> = {};
    for (const section of course.sections) {
      const batchCourse = batchData.courses?.find((gradeData) => {
        if (
          gradeData.instructor_name === section.instructor_name[0] &&
          gradeData.course_name === course.code
        ) {
          return gradeData;
        }
        return null;
      });

      const profData = batchData.profs?.filter(
        (prof) => prof.master_name === section.instructor_name[0],
      )[0];
      let correctedCourse: GradeData | undefined = undefined;
      if (batchCourse) {
        correctedCourse = {
          ...batchCourse,
          a_average: parseFloat(String(batchCourse.a_average ?? "0")),
          b_average: parseFloat(String(batchCourse.b_average ?? "0")),
          c_average: parseFloat(String(batchCourse.c_average ?? "0")),
          d_average: parseFloat(String(batchCourse.d_average ?? "0")),
          f_average: parseFloat(String(batchCourse.f_average ?? "0")),
          class_avg_min: parseFloat(String(batchCourse.class_avg_min ?? "0")),
          class_avg_max: parseFloat(String(batchCourse.class_avg_max ?? "0")),
        };
      }
      // Add cart functionality fields to section
      const modifiedSection: ModifiedSection = {
        ...section,
        grade_distribution: correctedCourse,
        professor_rating: profData,
        // Cart functionality fields with default values
        course_id: reqCourse?.course_id,
        catalog_nbr,
        course_career: "UGRD", // Default for undergraduate
        session_code: "1", // Default session
        grading_basis: "GRD", // Default grading basis
        rqmnt_designtn: "", // Default requirement designation
        wait_list_okay: "N", // Default waitlist setting
        courseData: course, // Reference to parent course
      };
      modifiedSections[section.id] = modifiedSection;
    }
    const groupedSections = groupSections(course.sections, modifiedSections);
    mergedCourse.sections = groupedSections;
    mergedData[cacheKey] = mergedCourse;
  }

  return mergedData;
}
