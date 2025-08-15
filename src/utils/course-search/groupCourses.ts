import type { RequiredCourse } from "../../degree-planning/types/Plans";

/**
 * Groups required courses by subject abbreviation.
 *
 * @param {RequiredCourse[]} courses Flat list of required courses
 * @returns {Record<string, RequiredCourse[]>} Map of subject -> courses
 */
export function groupCourses(courses: RequiredCourse[]) {
  const grouped = courses.reduce(
    (groupedArray: Record<string, RequiredCourse[]>, item) => {
      if (!groupedArray[item.course_abr]) {
        groupedArray[item.course_abr] = [];
      }
      groupedArray[item.course_abr].push(item);
      return groupedArray;
    },
    {},
  );
  return grouped;
}
