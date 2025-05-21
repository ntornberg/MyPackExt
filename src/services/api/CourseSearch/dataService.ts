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
  term: string,
  onProgress?: (progress: number, statusMessage?: string) => void
): Promise<MergedCourseData | null> {
  // Report initial progress
  onProgress?.(10, `Initializing search for ${courseAbr} ${catalogNum}`);
  
  const courseKey = `${courseAbr} ${catalogNum}`;
  AppLogger.info("Fetching single course data for:", courseKey, term);
  
  // Generate hash for persistent cache lookup
  const cacheKey = courseKey + ' ' + term;
  const hashKey = await generateCacheKey(cacheKey);
  
  // Check cache first
  onProgress?.(30, `Checking cache for ${courseKey}`);
  const cachedCourse = await getGenericCache("openCourses", hashKey);
  if (cachedCourse) {
    AppLogger.info("Cache hit for:", cacheKey);
    onProgress?.(100, `Found ${courseKey} in cache`);
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
  onProgress?.(40, `Fetching ${courseKey} data from API`);
  const response = await searchOpenCoursesByParams(term, courseAbr, catalogNum);
  
  if (!response) {
    AppLogger.error("No data returned from searchOpenCourses");
    onProgress?.(100, `No data found for ${courseKey}`);
    return null;
  }
  
  // Prepare data for API request
  onProgress?.(50, `Processing ${courseKey} sections`);
  const courses_to_fetch = response.sections
    .filter(section => section.instructor_name.length > 0 && response.code.length > 0)
    .map(section => ({
      course_title: response.code,
      instructor_name: section.instructor_name[0]
    }));
  
  if (courses_to_fetch.length === 0) {
    // No sections with instructors found
    onProgress?.(100, `Completed processing ${courseKey} (no instructor data)`);
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
  onProgress?.(60, `Fetching additional data for ${courseKey}`);
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
    onProgress?.(100, `Error fetching data for ${courseKey}`);
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
  onProgress?.(70, `Processing professor and grade data for ${courseKey}`);
  const combinedData = await apiResponse.json() as BatchDataRequestResponse;
  const courseInfoMap: Record<string, RequiredCourse> = {
    [courseKey]: course
  };
  const courseDataMap: Record<string, CourseData> = {
    [courseKey]: response
  };
  
  onProgress?.(80, `Merging data for ${courseKey}`);
  const mergedData = mergeData(courseDataMap, combinedData, courseInfoMap);
  const result = mergedData[courseKey];
  
  // Cache the result
  onProgress?.(90, `Caching results for ${courseKey}`);
  await setGenericCache("openCourses", hashKey, JSON.stringify(result));
  
  onProgress?.(100, `Completed processing ${courseKey}`); // Complete
  return result;
}

/**
 * Fetches course search data from the backend API.
 * @param {Requirement[]} requirements - The requirements to fetch data for.
 * @param {string} term - The term to fetch data for.
 * @param {Function} onProgress - Optional callback for tracking progress.
 * @returns {Promise<Record<string, MergedCourseData> | null>} - A promise with course data mapped by course key.
 */
export async function fetchCourseSearchData(
  requirements: Requirement[],
  term: string,
  onProgress?: (progress: number, statusMessage?: string) => void
): Promise<Record<string, MergedCourseData> | null> {
  const result: Record<string, MergedCourseData> = {};
  
  // Initial progress
  onProgress?.(10, "Initializing course search");
  
  // Get total courses to track progress
  let totalCourses = 0;
  let processedCourses = 0;
  
  for (const rq of Object.values(requirements) as Requirement[]) {
    totalCourses += rq.courses.length;
  }
  
  onProgress?.(15, `Preparing to process ${totalCourses} courses`);
  
  // Progress increments - reserve 10% for start, 10% for finish
  const courseIncrement = totalCourses > 0 ? 80 / totalCourses : 80;
  
  // Process all courses from all requirements
  for (const rq of Object.values(requirements) as Requirement[]) {
    for (const course of rq.courses as RequiredCourse[]) {
      const courseKey = `${course.course_abr} ${course.catalog_num}`;
      onProgress?.(
        15 + Math.round(processedCourses * courseIncrement), 
        `Processing course ${processedCourses + 1}/${totalCourses}: ${courseKey}`
      );
      
      const courseData = await fetchSingleCourseData(
        course.course_abr, 
        course.catalog_num, 
        course.course_id,
        term
      );
      
      // Update progress after each course
      processedCourses++;
      
      if (courseData) {
        const courseKey = `${course.course_abr}-${course.catalog_num}`;
        result[courseKey] = courseData;
      }
    }
  }
  
  if (Object.keys(result).length === 0) {
    AppLogger.warn("No course data found for any requirements");
    onProgress?.(100, "No course data found");
    return null;
  }
  
  // Complete
  onProgress?.(100, `Completed processing ${totalCourses} courses`);
  return result;
}

export async function fetchGEPCourseData(
  courses: RequiredCourse[], 
  term: string,
  onProgress?: (progress: number, statusMessage?: string) => void
): Promise<Record<string, MergedCourseData> | null> {
  const result: Record<string, MergedCourseData> = {};
  
  // Report initial progress
  onProgress?.(10, `Initializing search for ${courses.length} GEP courses`);
  
  // Process all courses
  const totalCourses = courses.length;
  for (let i = 0; i < totalCourses; i++) {
    const course = courses[i];
    const courseKey = `${course.course_abr} ${course.catalog_num}`;
    
    // Calculate progress (10% at start, 95% when all courses are done)
    const courseProgress = 10 + Math.round(((i + 1) / totalCourses) * 85);
    onProgress?.(courseProgress, `Processing course ${i + 1}/${totalCourses}: ${courseKey}`);
    
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
  
  if (Object.keys(result).length === 0) {
    AppLogger.warn("No course data found for any GEP requirements");
    onProgress?.(100, "No GEP course data found"); // Complete
    return null;
  }
  
  onProgress?.(100, `Completed processing ${totalCourses} GEP courses`); // Complete
  return result;
}
