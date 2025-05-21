import { AppLogger } from '../../../utils/logger';
import { generateCacheKey, getGenericCache, setGenericCache } from "../../../cache/CourseRetrieval";
import { searchOpenCoursesByParams } from './searchService';
import { mergeData } from '../../../utils/CourseSearch/MergeDataUtil';
import type { RequiredCourse, Requirement } from '../../../types/Plans';
import type { CourseData } from '../../../utils/CourseSearch/ParseRegistrarUtil';
import type { MergedCourseData } from '../../../utils/CourseSearch/MergeDataUtil';
import type { BatchDataRequestResponse } from '../types';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../../config';

/**
 * Constants for cache namespaces
 */
const CACHE_KEYS = {
  OPEN_COURSES: "openCourses",
  GRADE_PROF: "gradeProfData"
};

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
  const openCoursesCacheKey = courseKey + ' ' + term;
  const openCoursesHashKey = await generateCacheKey(openCoursesCacheKey);
  
  // Check open courses cache first
  onProgress?.(20, `Checking open courses cache for ${courseKey}`);
  const cachedOpenCourses = await getGenericCache(CACHE_KEYS.OPEN_COURSES, openCoursesHashKey);
  
  // Define course object for API calls
  const course: RequiredCourse = {
    course_abr: courseAbr,
    catalog_num: catalogNum,
    course_descrip: '',
    course_id: course_id
  };

  let courseData: CourseData | null = null;
  
  // If open courses are cached, use them
  if (cachedOpenCourses) {
    AppLogger.info("Open courses cache hit for:", courseKey);
    courseData = JSON.parse(cachedOpenCourses.combinedData);
    onProgress?.(30, `Found open courses data in cache for ${courseKey}`);
  } else {
    // Fetch open courses if not in cache
    AppLogger.info("Open courses cache miss for:", courseKey, "fetching from API");
    onProgress?.(30, `Fetching open courses data for ${courseKey}`);
    courseData = await searchOpenCoursesByParams(term, courseAbr, catalogNum);
    
    if (!courseData) {
      AppLogger.error("No open courses data returned for", courseKey);
      onProgress?.(100, `No open courses data found for ${courseKey}`);
      return null;
    }
    
    // Cache open courses data
    await setGenericCache(CACHE_KEYS.OPEN_COURSES, openCoursesHashKey, JSON.stringify(courseData));
    onProgress?.(40, `Cached open courses data for ${courseKey}`);
  }
  
  // Check if courseData exists
  if (!courseData) {
    AppLogger.error("No course data available for", courseKey);
    onProgress?.(100, `No course data available for ${courseKey}`);
    return null;
  }
  
  // Prepare data for grade/professor API request
  onProgress?.(50, `Processing ${courseKey} sections for grade/professor data`);
  
  // Filter sections with instructor names
  const courseSectionsWithProfs = courseData.sections
    .filter(section => section.instructor_name.length > 0 && courseData.code.length > 0)
    .map(section => ({
      course_title: courseData.code,
      instructor_name: section.instructor_name[0]
    }));
  
  // If no sections with professors, return just the course data
  if (courseSectionsWithProfs.length === 0) {
    onProgress?.(100, `Completed processing ${courseKey} (no instructor data)`);
    const mergedCourse: MergedCourseData = {
      ...courseData,
      sections: courseData.sections.map(section => ({
        ...section,
        grade_distribution: undefined,
        professor_rating: undefined
      }))
    };
    return mergedCourse;
  }
  
  // Generate hash for grade/professor cache lookup
  const gradeProfCacheKey = `${courseKey}-gradeprof-${term}`;
  const gradeProfHashKey = await generateCacheKey(gradeProfCacheKey);
  
  // Check grade/professor cache
  onProgress?.(60, `Checking grade/professor cache for ${courseKey}`);
  const cachedGradeProf = await getGenericCache(CACHE_KEYS.GRADE_PROF, gradeProfHashKey);
  
  let gradeProfData: BatchDataRequestResponse | null = null;
  
  // If grade/professor data is cached, use it
  if (cachedGradeProf) {
    AppLogger.info("Grade/professor cache hit for:", courseKey);
    gradeProfData = JSON.parse(cachedGradeProf.combinedData);
    onProgress?.(70, `Found grade/professor data in cache for ${courseKey}`);
  } else {
    // Fetch grade/professor data if not in cache
    onProgress?.(70, `Fetching grade/professor data for ${courseKey}`);
    try {
      const url = `${SUPABASE_URL}/functions/v1/clever-function`;
      const apiResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(courseSectionsWithProfs)
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status} ${apiResponse.statusText}`);
      }
      
      const jsonResponse = await apiResponse.json();
      gradeProfData = jsonResponse.data as BatchDataRequestResponse;
      // Cache grade/professor data
      await setGenericCache(CACHE_KEYS.GRADE_PROF, gradeProfHashKey, JSON.stringify(gradeProfData));
      onProgress?.(80, `Cached grade/professor data for ${courseKey}`);
    } catch (error) {
      AppLogger.error("Error fetching grade/professor data:", error);
      onProgress?.(85, `Error fetching grade/professor data: ${error}`);
      // Return course data without grade/professor info if fetch fails
      const mergedCourse: MergedCourseData = {
        ...courseData,
        sections: courseData.sections.map(section => ({
          ...section,
          grade_distribution: undefined,
          professor_rating: undefined
        }))
      };
      return mergedCourse;
    }
  }
  
  // Merge data
  onProgress?.(90, `Merging data for ${courseKey}`);
  const courseInfoMap: Record<string, RequiredCourse> = {
    [courseKey]: course
  };
  const courseDataMap: Record<string, CourseData> = {
    [courseKey]: courseData
  };
  
  const mergedData = mergeData(courseDataMap, gradeProfData || {}, courseInfoMap);
  const result = mergedData[courseKey];
  
  onProgress?.(100, `Completed processing ${courseKey}`);
  return result;
}

/**
 * Batch processes multiple courses with separate caching for open courses and grade/professor data
 * @param courses Array of required courses to fetch data for
 * @param term Academic term
 * @param onProgress Optional callback for tracking progress
 * @returns Promise with course data mapped by course key
 */
export async function batchFetchCoursesData(
  courses: RequiredCourse[],
  term: string,
  onProgress?: (progress: number, statusMessage?: string) => void
): Promise<Record<string, MergedCourseData>> {
  const result: Record<string, MergedCourseData> = {};
  
  // Report initial progress
  onProgress?.(5, `Starting batch processing for ${courses.length} courses`);
  
  if (courses.length === 0) {
    onProgress?.(100, "No courses to process");
    return result;
  }
  
  // Phase 1: Check Open Courses Cache
  onProgress?.(10, "Checking open courses cache");
  
  // Generate cache keys and prepare lookup data
  const courseKeyMapping: Record<string, RequiredCourse> = {};
  const openCoursesCache: Record<string, CourseData> = {};
  const openCoursesToFetch: RequiredCourse[] = [];
  const openCoursesHashKeys: Record<string, string> = {};
  
  // Check open courses cache in parallel
  const openCoursesCachePromises: Promise<any>[] = [];
  
  for (const course of courses) {
    const courseKey = `${course.course_abr} ${course.catalog_num}`;
    courseKeyMapping[courseKey] = course;
    
    const openCoursesCacheKey = courseKey + ' ' + term;
    const cachePromise = generateCacheKey(openCoursesCacheKey).then(async hashKey => {
      openCoursesHashKeys[courseKey] = hashKey;
      const cachedData = await getGenericCache(CACHE_KEYS.OPEN_COURSES, hashKey);
      
      if (cachedData) {
        // Open courses cache hit
        openCoursesCache[courseKey] = JSON.parse(cachedData.combinedData);
        return { cached: true, course, courseKey };
      } else {
        // Open courses cache miss
        openCoursesToFetch.push(course);
        return { cached: false, course, courseKey };
      }
    });
    
    openCoursesCachePromises.push(cachePromise);
  }
  
  // Wait for all open courses cache checks to complete
  await Promise.all(openCoursesCachePromises);
  
  // Phase 2: Fetch Missing Open Courses Data
  if (openCoursesToFetch.length > 0) {
    onProgress?.(20, `Fetching open courses data for ${openCoursesToFetch.length} courses`);
    
    // Fetch all missing open courses in parallel
    const openCoursesPromises: Promise<any>[] = [];
    
    for (const course of openCoursesToFetch) {
      const courseKey = `${course.course_abr} ${course.catalog_num}`;
      
      const fetchPromise = searchOpenCoursesByParams(term, course.course_abr, course.catalog_num)
        .then(async courseData => {
          if (courseData) {
            // Store course data for later use
            openCoursesCache[courseKey] = courseData;
            
            // Cache the open courses data
            const hashKey = openCoursesHashKeys[courseKey];
            await setGenericCache(CACHE_KEYS.OPEN_COURSES, hashKey, JSON.stringify(courseData));
          }
          return { courseKey, courseData };
        });
      
      openCoursesPromises.push(fetchPromise);
    }
    
    await Promise.all(openCoursesPromises);
  }
  
  // Phase 3: Prepare for Grade/Professor Data
  onProgress?.(30, "Processing course sections and checking grade/professor cache");
  
  // Collect all sections with instructors for API call
  const sectionsToFetch: { course_title: string; instructor_name: string }[] = [];
  const gradeProfCachePromises: Promise<any>[] = [];
  const gradeProfCache: Record<string, BatchDataRequestResponse> = {};
  const gradeProfHashKeys: Record<string, string> = {};
  const courseKeyToSections: Record<string, any[]> = {};
  
  // For each course with open courses data, check grade/prof cache
  for (const [courseKey, courseData] of Object.entries(openCoursesCache)) {
    // Skip null course data
    if (!courseData) continue;
    
    // Extract sections with instructor names
    const sections = courseData.sections
      .filter(section => section.instructor_name.length > 0 && courseData.code.length > 0)
      .map(section => ({
        course_title: courseData.code,
        instructor_name: section.instructor_name[0]
      }));
    
    // Store sections mapping for later
    courseKeyToSections[courseKey] = sections;
    
    if (sections.length === 0) {
      continue; // Skip grade/prof lookup if no sections with instructors
    }
    
    // Check grade/prof cache
    const gradeProfCacheKey = `${courseKey}-gradeprof-${term}`;
    const cachePromise = generateCacheKey(gradeProfCacheKey).then(async hashKey => {
      gradeProfHashKeys[courseKey] = hashKey;
      const cachedData = await getGenericCache(CACHE_KEYS.GRADE_PROF, hashKey);
      
      if (cachedData) {
        // Grade/prof cache hit
        gradeProfCache[courseKey] = JSON.parse(cachedData.combinedData);
        return { cached: true, courseKey };
      } else {
        // Grade/prof cache miss - add sections to fetch list
        sectionsToFetch.push(...sections);
        return { cached: false, courseKey };
      }
    });
    
    gradeProfCachePromises.push(cachePromise);
  }
  
  // Wait for all grade/professor cache checks to complete
  await Promise.all(gradeProfCachePromises);
  
  // Phase 4: Fetch Missing Grade/Professor Data (single API call)
  let batchGradeProfData: BatchDataRequestResponse | null = null;
  
  if (sectionsToFetch.length > 0) {
    onProgress?.(50, `Fetching grade/professor data for ${sectionsToFetch.length} sections`);
    
    try {
      const url = `${SUPABASE_URL}/functions/v1/clever-function`;
      const apiResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(sectionsToFetch)
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status} ${apiResponse.statusText}`);
      }
      
      const jsonResponse = await apiResponse.json();
      batchGradeProfData = jsonResponse.data as BatchDataRequestResponse;
      
      // Store in the cache for each course
      onProgress?.(60, "Caching grade/professor data");
      
      // We need to split the batch data by course
      for (const [courseKey, sections] of Object.entries(courseKeyToSections)) {
        if (sections.length > 0 && !gradeProfCache[courseKey]) {
          const hashKey = gradeProfHashKeys[courseKey];
          if (hashKey && batchGradeProfData) {
            AppLogger.info("Caching grade/professor data for course: ",courseKey);
            AppLogger.info("Batch grade/professor data: ",batchGradeProfData);
            AppLogger.info("Hash key: ",hashKey);
            
            const data_to_cache = {
              courses: batchGradeProfData.courses?.filter((course) => course.course_name === courseKey) || [],
              profs: batchGradeProfData.profs?.filter((prof) => 
                sections.some((section) => section.instructor_name === prof.master_name)
              ) || []
            };
            await setGenericCache(CACHE_KEYS.GRADE_PROF, hashKey, JSON.stringify(data_to_cache));
            gradeProfCache[courseKey] = data_to_cache;
          }
        }
      }
    } catch (error) {
      AppLogger.error("Error in batch grade/professor fetch:", error);
      onProgress?.(65, `Error fetching grade/professor data: ${error}`);
      // Continue with the available data, grades/professor data will be undefined
    }
  }
  
  // Phase 5: Merge Data for Each Course
  onProgress?.(70, "Merging course data");
  AppLogger.info("Merging course data",openCoursesCache,gradeProfCache,courseKeyMapping,courseKeyToSections);
  for (const [courseKey, courseData] of Object.entries(openCoursesCache)) {
    // Skip null course data
    if (!courseData) continue;
    
    const course = courseKeyMapping[courseKey];
    const courseInfoMap: Record<string, RequiredCourse> = { [courseKey]: course };
    const courseDataMap: Record<string, CourseData> = { [courseKey]: courseData };
    
    // Get grade/professor data if available
    const gradeProfData = gradeProfCache[courseKey] || null;
    
    let mergedCourseData: MergedCourseData;
    
    if (gradeProfData) {
      // Merge with grade/professor data
      const mergedData = mergeData(courseDataMap, gradeProfData, courseInfoMap);
      mergedCourseData = mergedData[courseKey];
    } else {
      // No grade/professor data, use course data only
      mergedCourseData = {
        ...courseData,
        sections: courseData.sections.map(section => ({
          ...section,
          grade_distribution: undefined,
          professor_rating: undefined
        }))
      };
    }
    
    // Store in result
    const resultKey = `${course.course_abr}-${course.catalog_num}`;
    result[resultKey] = mergedCourseData;
  }
  
  onProgress?.(100, `Completed processing ${courses.length} courses`);
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
  
  // Collect all courses from requirements
  let allCourses: RequiredCourse[] = [];
  for (const rq of Object.values(requirements) as Requirement[]) {
    allCourses = [...allCourses, ...rq.courses];
  }
  
  onProgress?.(15, `Preparing to process ${allCourses.length} courses`);
  
  // Use the new batch processing function
  if (allCourses.length > 0) {
    try {
      const batchResults = await batchFetchCoursesData(
        allCourses, 
        term,
        (progress, statusMessage) => {
          // Scale progress to fit between 15-95%
          const scaledProgress = 15 + Math.round(progress * 0.8);
          onProgress?.(scaledProgress, statusMessage);
        }
      );
      
      // Copy results to our result object
      Object.assign(result, batchResults);
    } catch (error) {
      AppLogger.error("Error in batch processing:", error);
      onProgress?.(95, `Error: ${error}`);
    }
  }
  
  if (Object.keys(result).length === 0) {
    AppLogger.warn("No course data found for any requirements");
    onProgress?.(100, "No course data found");
    return null;
  }
  
  // Complete
  onProgress?.(100, `Completed processing ${allCourses.length} courses`);
  return result;
}

export async function fetchGEPCourseData(
  courses: RequiredCourse[], 
  term: string,
  onProgress?: (progress: number, statusMessage?: string) => void
): Promise<Record<string, MergedCourseData> | null> {
  // Initial progress
  onProgress?.(10, `Initializing search for ${courses.length} GEP courses`);
  
  if (courses.length === 0) {
    onProgress?.(100, "No GEP courses to process");
    return null;
  }
  
  // Use the new batch processing function
  try {
    const batchResults = await batchFetchCoursesData(
      courses, 
      term,
      (progress, statusMessage) => {
        // Scale progress to fit between 10-95%
        const scaledProgress = 10 + Math.round(progress * 0.85);
        onProgress?.(scaledProgress, statusMessage);
      }
    );
    
    if (Object.keys(batchResults).length === 0) {
      AppLogger.warn("No course data found for any GEP requirements");
      onProgress?.(100, "No GEP course data found");
      return null;
    }
    
    onProgress?.(100, `Completed processing ${courses.length} GEP courses`);
    return batchResults;
    
  } catch (error) {
    AppLogger.error("Error fetching GEP course data:", error);
    onProgress?.(100, `Error: ${error}`);
    return null;
  }
}
