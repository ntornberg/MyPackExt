import { AppLogger } from '../../../utils/logger';
import { generateCacheKey, getGenericCache, setGenericCache } from "../../../cache/CourseRetrieval";
import { searchOpenCoursesByParams } from './searchService';
import { mergeData } from '../../../utils/CourseSearch/MergeDataUtil';
import type { RequiredCourse, Requirement } from '../../../types/Plans';
import type { CourseData } from '../../../utils/CourseSearch/ParseRegistrarUtil';
import type { MergedCourseData } from '../../../utils/CourseSearch/MergeDataUtil';
import type { BatchDataRequestResponse } from '../types';

/**
 * Fetches course data for a single course
 * @param courseAbr Course abbreviation (e.g., "CSC")
 * @param catalogNum Catalog number (e.g., "316")
 * @param term Academic term
 * @returns Promise with course data or null if not found
 */
export async function fetchSingleCourseData(
  courseAbr: string,
  catalogNum: string,
  course_id: string,
  term: string
): Promise<MergedCourseData | null> {
  const courseKey = `${courseAbr} ${catalogNum}`;
  AppLogger.info("Fetching single course data for:", courseKey, term);
  
  // Generate hash for persistent cache lookup
  const cacheKey = courseKey + ' ' + term;
  const hashKey = await generateCacheKey(cacheKey);
  
  // Check cache first
  const cachedCourse = await getGenericCache("openCourses", hashKey);
  if (cachedCourse) {
    AppLogger.info("Cache hit for:", cacheKey);
    return JSON.parse(cachedCourse.combinedData);
  }
  
  // Create a mock RequiredCourse object for the searchOpenCourses function
  const course: RequiredCourse = {
    course_abr: courseAbr,
    catalog_num: catalogNum,
    course_descrip: '',
    course_id: course_id
  };
  
  // Fetch course data
  AppLogger.info("Cache miss for:", cacheKey, "fetching from API");
  const response = await searchOpenCoursesByParams(term, courseAbr, catalogNum);
  
  if (!response) {
    AppLogger.error("No data returned from searchOpenCourses");
    return null;
  }
  
  // Prepare data for API request
  const courses_to_fetch = response.sections
    .filter(section => section.instructor_name.length > 0 && response.code.length > 0)
    .map(section => ({
      course_title: response.code,
      instructor_name: section.instructor_name[0]
    }));
  
  if (courses_to_fetch.length === 0) {
    // No sections with instructors found
    const mergedCourse: MergedCourseData = {
      ...response,
      sections: response.sections.map(section => ({
        ...section,
        grade_distribution: undefined,
        professor_rating: undefined
      }))
    };
    return mergedCourse;
  }
  
  // Fetch grade and professor data
  const url = `https://app-gradefetchbackend.azurewebsites.net/api/user/allCourses`;
  const apiResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courses_to_fetch)
  });
  
  if (!apiResponse.ok) {
    AppLogger.error("Error fetching combined data:", apiResponse.status, apiResponse.statusText);
    const mergedCourse: MergedCourseData = {
      ...response,
      sections: response.sections.map(section => ({
        ...section,
        grade_distribution: undefined,
        professor_rating: undefined
      }))
    };
    return mergedCourse;
  }
  
  // Merge data
  const combinedData = await apiResponse.json() as BatchDataRequestResponse;
  const courseInfoMap: Record<string, RequiredCourse> = {
    [courseKey]: course
  };
  const courseDataMap: Record<string, CourseData> = {
    [courseKey]: response
  };
  
  const mergedData = mergeData(courseDataMap, combinedData, courseInfoMap);
  const result = mergedData[courseKey];
  
  // Cache the result
  await setGenericCache("openCourses", hashKey, JSON.stringify(result));
  
  return result;
}

/**
 * Fetches course search data from the backend API.
 * @param {Requirement[]} requirements - The requirements to fetch data for.
 * @param {string} term - The term to fetch data for.
 * @returns {Promise<Record<string, MergedCourseData> | null>} - A promise with course data mapped by course key.
 */
export async function fetchCourseSearchData(
  requirements: Requirement[],
  term: string
): Promise<Record<string, MergedCourseData> | null> {
  const result: Record<string, MergedCourseData> = {};
  
  // Process all courses from all requirements
  for (const rq of Object.values(requirements) as Requirement[]) {
    for (const course of rq.courses as RequiredCourse[]) {
      const courseData = await fetchSingleCourseData(
        course.course_abr, 
        course.catalog_num, 
        course.course_id,
        term
      );
      
      if (courseData) {
        const courseKey = `${course.course_abr}-${course.catalog_num}`;
        result[courseKey] = courseData;
      }
    }
  }
  
  if (Object.keys(result).length === 0) {
    AppLogger.warn("No course data found for any requirements");
    return null;
  }
  
  return result;
} 