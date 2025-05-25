import { AppLogger } from '../../../utils/logger';
import { generateCacheKey, getGenericCache, setGenericCache } from "../../../cache/CourseRetrieval";
import { batchSearchOpenCourses, searchOpenCoursesByParams } from './searchService';

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
  GRADE_PROF: "gradeProfData",
  NULL_COURSES: "nullCourses"  // Cache for courses that return no data
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
  
  // Check if this course is known to return null
  onProgress?.(15, `Checking if ${courseKey} is known to be unavailable`);
  const nullCacheKey = `null-${openCoursesCacheKey}`;
  const nullHashKey = await generateCacheKey(nullCacheKey);
  const cachedNull = await getGenericCache(CACHE_KEYS.NULL_COURSES, nullHashKey);
  
  if (cachedNull) {
    AppLogger.info(`Course ${courseKey} is cached as null, skipping API call`);
    onProgress?.(100, `Course ${courseKey} is not available`);
    return null;
  }
  
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
      
      // Cache null result to avoid future API calls
      await setGenericCache(CACHE_KEYS.NULL_COURSES, nullHashKey, { 
        courseKey, 
        term, 
        reason: 'API returned null' 
      });
      
      onProgress?.(100, `No open courses data found for ${courseKey}`);
      return null;
    }
    
    // Cache open courses data
    await setGenericCache(CACHE_KEYS.OPEN_COURSES, openCoursesHashKey, JSON.stringify(courseData),120);
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
  const instructorList = courseSectionsWithProfs.map(cs => cs.instructor_name).sort().join(',');
  const gradeProfCacheKey = `${courseKey}-${instructorList}-${term}`;
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
  AppLogger.info(`[BATCH DEBUG] Starting batch processing for ${courses.length} courses, term: ${term}`);
  
  if (!courses || courses.length === 0) {
    onProgress?.(100, "No courses to process");
    return result;
  }
  
  // Phase 1: Check Open Courses Cache
  onProgress?.(10, "Checking open courses cache");
  AppLogger.info(`[BATCH DEBUG] Phase 1: Checking open courses cache for ${courses.length} courses`);
  
  // Generate cache keys and prepare lookup data
  const courseKeyMapping: Record<string, RequiredCourse> = {}; // Used to find the course id when merging the data
  const openCoursesCache: Record<string, CourseData> = {}; // Used to store the data that is already in cache
  const openCoursesToFetch: Record<string,RequiredCourse> = {}; // Used to store the data that needs to be fetched from the API
  const openCoursesHashKeys: Record<string, string> = {}; // Used when storing the data in cache that needed to be fetched
  
  // Create a promise for each course to check the cache in parallel
  // Gets the course key, hash key, and checks if the course is known to return null
  // Adds the course to the openCoursesCache if it is in the cache
  // Adds the course to the openCoursesToFetch if it is not in the cache
  const openCoursesCachePromises = courses.map(async (course) => {
    const courseKey = `${course.course_abr} ${course.catalog_num}`;
    courseKeyMapping[courseKey] = course;
    
    const openCoursesCacheKey = courseKey + ' ' + term;
    // Log just the cache key format once
    if (course === courses[0]) {
      AppLogger.info(`[CACHE KEY FORMAT] Cache key format: "${openCoursesCacheKey}" -> hash`);
    }
    const hashKey = await generateCacheKey(openCoursesCacheKey);
    openCoursesHashKeys[courseKey] = hashKey;
    
    // Check if this course is known to return null
    const nullCacheKey = `null-${openCoursesCacheKey}`;
    const nullHashKey = await generateCacheKey(nullCacheKey);
    const cachedNull = await getGenericCache(CACHE_KEYS.NULL_COURSES, nullHashKey);
    
    if (cachedNull) {
      // This course is known to return null, skip it
      AppLogger.info(`[CACHE NULL] Course ${courseKey} known to return null, skipping`);
      return { cached: true, courseKey, isNull: true };
    }
    
    // Check cache for actual course data
    const cachedData = await getGenericCache(CACHE_KEYS.OPEN_COURSES, hashKey);
    
    if (cachedData) {
      // Cache hit - only log sample data for the first hit
      const cachedCourseData = JSON.parse(cachedData.combinedData);
      
      
      
      openCoursesCache[courseKey] = cachedCourseData;
      return { cached: true, courseKey };
    } else {
      // Cache miss
      openCoursesToFetch[courseKey] = course;
      return { cached: false, courseKey };
    }
  });
  
  // Wait for all cache check promises to complete
  await Promise.all(openCoursesCachePromises);
  
  AppLogger.info(`[BATCH DEBUG] Cache check complete. ${Object.keys(openCoursesCache).length} courses from cache, ${openCoursesToFetch.length} to fetch.`);
  
  // Phase 2: Fetch Missing Open Courses Data (in parallel)
  if (Object.keys(openCoursesToFetch).length > 0) {
    onProgress?.(20, `Fetching open courses data for ${openCoursesToFetch.length} courses`);
    AppLogger.info(`[BATCH DEBUG] Phase 2: Fetching ${openCoursesToFetch.length} courses from API`);
    
    // Create a promise for each course to fetch
    //const groupedCourses = GroupCourses(openCoursesToFetch);
    const subjects_to_fetch = [...new Set(Object.values(openCoursesToFetch).map((course) => course.course_abr))]
    AppLogger.info("Fetching subjects",subjects_to_fetch);  
    const fetchPromises = subjects_to_fetch.map(async (subject) => {
      //const courseKey = `${course.course_abr} ${course.catalog_num}`;
      try {
        AppLogger.info("Term:",term);
        onProgress?.(25, `Fetching open courses data for ${subject}`);
        const courseData = await batchSearchOpenCourses(term, subject);
        AppLogger.info("Found courses", courseData);
        if (courseData) {
        
         if( Array.isArray(courseData)){
          const filteredCourseData = courseData.filter((course) =>{
            AppLogger.info("Course Title:",course.code)
            return openCoursesToFetch[`${course.code}`];
          })
          AppLogger.info("Filtered",filteredCourseData)
          for(const course of filteredCourseData){
          const hashKey = openCoursesHashKeys[course.code];
          const cacheData = JSON.stringify(course);
          await setGenericCache(CACHE_KEYS.OPEN_COURSES,hashKey,cacheData)
          openCoursesCache[course.code] = course;
         }
        }else{  
          const filteredCourseData = openCoursesToFetch[`${courseData.code}`]
          if(!filteredCourseData){
          const nullCacheKey = `null-${courseData.code}`;
          const nullHashKey = await generateCacheKey(nullCacheKey);
          await setGenericCache(CACHE_KEYS.NULL_COURSES, nullHashKey, { 
            courseKey : courseData.code, 
            term, 
            reason: 'API returned null' 
          });
        }else{
          const hashKey = openCoursesHashKeys[courseData.code];
          const cacheData = JSON.stringify(courseData);
          await setGenericCache(CACHE_KEYS.OPEN_COURSES,hashKey,cacheData)
          openCoursesCache[courseData.code] = courseData;
        }
        }
        
          return { success: true, subject };
        } else {
         
          return { success: false, subject };
        }
      } catch (error) {
        AppLogger.error(`Error fetching course data for ${subject}:`, error);
        return { success: false, subject, error };
      }
    });
    
    await Promise.all(fetchPromises);
  }
  
  AppLogger.info(`[BATCH DEBUG] Phase 2 complete. Have data for ${Object.keys(openCoursesCache).length} courses.`);
  
  // Log courses with and without sections after fetching
  Object.entries(openCoursesCache).forEach(([key, data]) => {
    const sectionsCount = data?.sections?.length || 0;
    AppLogger.info(`[BATCH DEBUG] Course ${key}: ${sectionsCount} sections available`);
  });
  
  // Phase 4: Fetch Grade/Professor Data (per course)
  onProgress?.(50, "Processing grade/professor data for each course");
  
  // Process grade/professor data for each course individually
  const gradePromises = Object.entries(openCoursesCache).map(async ([courseKey, courseData]) => {
    if (!courseData || !courseData.sections) return;
    
    // Get sections with instructors for this specific course
    const courseSectionsWithProfs = courseData.sections
      .filter(section => section.instructor_name && section.instructor_name.length > 0 && courseData.code)
      .map(section => ({
        course_title: courseData.code,
        instructor_name: section.instructor_name[0]
      }));
    
    if (courseSectionsWithProfs.length === 0) return;
    
    // Create a course-specific cache key based on the course and its instructors
    const instructorList = courseSectionsWithProfs.map(cs => cs.instructor_name).sort().join(',');
    const gradeProfCacheKey = `${courseKey}-${instructorList}-${term}`;
    const gradeProfHashKey = await generateCacheKey(gradeProfCacheKey);
    
    // Check grade/professor cache for this specific course
    const cachedGradeProf = await getGenericCache(CACHE_KEYS.GRADE_PROF, gradeProfHashKey);
    
    let gradeProfData: BatchDataRequestResponse | null = null;
    
    if (cachedGradeProf) {
      gradeProfData = JSON.parse(cachedGradeProf.combinedData);
      AppLogger.info(`[GRADE CACHE HIT] Found cached grade/prof data for ${courseKey}`);
    } else {
      // Fetch grade/professor data for this specific course
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
        
        // Cache grade/professor data for this specific course
        if (gradeProfData && (gradeProfData.courses?.length || gradeProfData.profs?.length)) {
          await setGenericCache(CACHE_KEYS.GRADE_PROF, gradeProfHashKey, JSON.stringify(gradeProfData));
          AppLogger.info(`[GRADE CACHE STORE] Cached grade/prof data for ${courseKey}`);
        }
      } catch (error) {
        AppLogger.error(`Error fetching grade/professor data for ${courseKey}:`, error);
        // Continue without grade/professor data for this course
      }
    }
    
    return { courseKey, gradeProfData };
  });
  
  // Wait for all grade/prof requests to complete
  const gradeResults = await Promise.all(gradePromises);
  
  // Combine all grade/prof data
  const combinedGradeProfData: BatchDataRequestResponse = {
    courses: [],
    profs: []
  };
  
  gradeResults.forEach(result => {
    if (result && result.gradeProfData) {
      if (result.gradeProfData.courses) {
        combinedGradeProfData.courses!.push(...result.gradeProfData.courses);
      }
      if (result.gradeProfData.profs) {
        combinedGradeProfData.profs!.push(...result.gradeProfData.profs);
      }
    }
  });
  
  // Phase 5: Merge Data
  onProgress?.(80, "Merging course data");
  
  // Merge data for each course
  const mergedData = mergeData(openCoursesCache, combinedGradeProfData, courseKeyMapping);
  
  // Add to result
  Object.assign(result, mergedData);
  
  // Log final result
  AppLogger.info(`[BATCH DEBUG] Final result summary:`);
  AppLogger.info(`[BATCH DEBUG] - Total courses: ${Object.keys(result).length}`);
  
  const coursesWithSections = Object.entries(result)
    .filter(([_, data]) => data.sections && data.sections.length > 0)
    .map(([key]) => key);
  
  AppLogger.info(`[BATCH DEBUG] - Courses with sections (${coursesWithSections.length}): ${coursesWithSections.join(', ')}`);
  
  const coursesWithoutSections = Object.entries(result)
    .filter(([_, data]) => !data.sections || data.sections.length === 0)
    .map(([key]) => key);
  
  AppLogger.info(`[BATCH DEBUG] - Courses without sections (${coursesWithoutSections.length}): ${coursesWithoutSections.join(', ')}`);
  
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
  AppLogger.info(`[GEP DEBUG] Starting fetchGEPCourseData for ${courses.length} courses, term: ${term}`);
  
  if (courses.length === 0) {
    onProgress?.(100, "No GEP courses to process");
    return null;
  }
  
  // Log courses being searched
  AppLogger.info(`[GEP DEBUG] Courses to fetch:`, courses.map(c => `${c.course_abr} ${c.catalog_num}`));
  
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
