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
  AppLogger.info(`[BATCH DEBUG] Starting batch processing for ${courses.length} courses, term: ${term}`);
  
  if (!courses || courses.length === 0) {
    onProgress?.(100, "No courses to process");
    return result;
  }
  
  // Phase 1: Check Open Courses Cache
  onProgress?.(10, "Checking open courses cache");
  AppLogger.info(`[BATCH DEBUG] Phase 1: Checking open courses cache for ${courses.length} courses`);
  
  // Generate cache keys and prepare lookup data
  const courseKeyMapping: Record<string, RequiredCourse> = {};
  const openCoursesCache: Record<string, CourseData> = {};
  const openCoursesToFetch: RequiredCourse[] = [];
  const openCoursesHashKeys: Record<string, string> = {};
  
  // Create a promise for each course to check the cache in parallel
  const openCoursesCachePromises = courses.map(async (course) => {
    const courseKey = `${course.course_abr} ${course.catalog_num}`;
    courseKeyMapping[courseKey] = course;
    
    const openCoursesCacheKey = courseKey + ' ' + term;
    AppLogger.info(`[BATCH DEBUG] Generating cache key for: "${openCoursesCacheKey}"`);
    const hashKey = await generateCacheKey(openCoursesCacheKey);
    openCoursesHashKeys[courseKey] = hashKey;
    
    // Check cache
    AppLogger.info(`[BATCH DEBUG] Checking cache for course: ${courseKey}, hash: ${hashKey}`);
    const cachedData = await getGenericCache(CACHE_KEYS.OPEN_COURSES, hashKey);
    
    if (cachedData) {
      // Cache hit
      AppLogger.info(`[BATCH DEBUG] Cache HIT for course: ${courseKey}`);
      const cachedCourseData = JSON.parse(cachedData.combinedData);
      
      // Log details of the cached data
      AppLogger.info(`[BATCH DEBUG] Retrieved cached data for ${courseKey}:`);
      AppLogger.info(`[BATCH DEBUG] - Title: ${cachedCourseData.title}`);
      AppLogger.info(`[BATCH DEBUG] - Code: ${cachedCourseData.code}`);
      AppLogger.info(`[BATCH DEBUG] - Sections count: ${cachedCourseData.sections?.length || 0}`);
      
      // Log a summary of each section
      if (cachedCourseData.sections && cachedCourseData.sections.length > 0) {
        cachedCourseData.sections.forEach((section: any, idx: number) => {
          AppLogger.info(`[BATCH DEBUG] - Section ${idx+1}: ${section.section}, ClassNum: ${section.classNumber}`);
        });
      } else {
        AppLogger.info(`[BATCH DEBUG] - No sections in cached data for ${courseKey}`);
      }
      
      openCoursesCache[courseKey] = cachedCourseData;
      
      // Log if course has sections
      const sectionsCount = openCoursesCache[courseKey]?.sections?.length || 0;
      AppLogger.info(`[BATCH DEBUG] Cached course ${courseKey} has ${sectionsCount} sections`);
      return { cached: true, courseKey };
    } else {
      // Cache miss
      AppLogger.info(`[BATCH DEBUG] Cache MISS for course: ${courseKey}, will fetch from API`);
      openCoursesToFetch.push(course);
      return { cached: false, courseKey };
    }
  });
  
  // Wait for all cache check promises to complete
  await Promise.all(openCoursesCachePromises);
  
  AppLogger.info(`[BATCH DEBUG] Cache check complete. ${Object.keys(openCoursesCache).length} courses from cache, ${openCoursesToFetch.length} to fetch.`);
  
  // Phase 2: Fetch Missing Open Courses Data (in parallel)
  if (openCoursesToFetch.length > 0) {
    onProgress?.(20, `Fetching open courses data for ${openCoursesToFetch.length} courses`);
    AppLogger.info(`[BATCH DEBUG] Phase 2: Fetching ${openCoursesToFetch.length} courses from API`);
    
    // Create a promise for each course to fetch
    const fetchPromises = openCoursesToFetch.map(async (course) => {
      const courseKey = `${course.course_abr} ${course.catalog_num}`;
      try {
        AppLogger.info(`[BATCH DEBUG] Fetching course data for: ${courseKey}`);
        const courseData = await searchOpenCoursesByParams(term, course.course_abr, course.catalog_num);
        if (courseData) {
          // Log the raw course data before caching
          AppLogger.info(`[BATCH DEBUG] Raw course data for ${courseKey}:`);
          AppLogger.info(`[BATCH DEBUG] - Title: ${courseData.title}`);
          AppLogger.info(`[BATCH DEBUG] - Code: ${courseData.code}`);
          AppLogger.info(`[BATCH DEBUG] - Sections count: ${courseData.sections?.length || 0}`);
          
          // Log details about each section
          if (courseData.sections && courseData.sections.length > 0) {
            courseData.sections.forEach((section, idx) => {
              AppLogger.info(`[BATCH DEBUG] - Section ${idx+1}:`);
              AppLogger.info(`[BATCH DEBUG]   - Section number: ${section.section}`);
              AppLogger.info(`[BATCH DEBUG]   - Class number: ${section.classNumber}`);
              AppLogger.info(`[BATCH DEBUG]   - Status: ${(section as any).status || 'Unknown'}`);
              AppLogger.info(`[BATCH DEBUG]   - Instructors: ${section.instructor_name?.join(', ') || 'None'}`);
            });
          } else {
            AppLogger.info(`[BATCH DEBUG] - No sections available for ${courseKey}`);
          }
          
          // Cache the result
          const hashKey = openCoursesHashKeys[courseKey];
          const cacheData = JSON.stringify(courseData);
          AppLogger.info(`[BATCH DEBUG] Caching course data for: ${courseKey}, hash: ${hashKey}`);
          AppLogger.info(`[BATCH DEBUG] Cache data preview (first 100 chars): ${cacheData.substring(0, 100)}...`);
          await setGenericCache(CACHE_KEYS.OPEN_COURSES, hashKey, cacheData);
          
          // Add to our data collection
          openCoursesCache[courseKey] = courseData;
          return { success: true, courseKey };
        } else {
          AppLogger.info(`[BATCH DEBUG] No data found for course: ${courseKey}`);
          return { success: false, courseKey };
        }
      } catch (error) {
        AppLogger.error(`[BATCH DEBUG] Error fetching course data for ${courseKey}:`, error);
        return { success: false, courseKey, error };
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
  
  // Phase 3: Prepare grade/professor data requests
  onProgress?.(40, "Processing course sections for grade/professor data");
  
  const courseSectionsWithProfs: { course_title: string; instructor_name: string }[] = [];
  const courseToSectionIndex: Record<string, number[]> = {};
  
  // Process all course data to extract professor information
  Object.entries(openCoursesCache).forEach(([courseKey, courseData]) => {
    if (!courseData || !courseData.sections) return;
    
    courseData.sections
      .forEach((section, index) => {
        if (section.instructor_name && section.instructor_name.length > 0 && courseData.code) {
          // Add to sections with professors
          const instructor = section.instructor_name[0];
          if (instructor) {
            courseSectionsWithProfs.push({
              course_title: courseData.code,
              instructor_name: instructor
            });
            
            // Track which section this corresponds to
            if (!courseToSectionIndex[courseKey]) {
              courseToSectionIndex[courseKey] = [];
            }
            courseToSectionIndex[courseKey].push(index);
          }
        }
      });
  });
  
  // Phase 4: Fetch Grade/Professor Data
  let gradeProfData: BatchDataRequestResponse | null = null;
  
  if (courseSectionsWithProfs.length > 0) {
    onProgress?.(50, `Fetching grade/professor data for ${courseSectionsWithProfs.length} sections`);
    
    // Generate hash for grade/professor cache lookup
    const gradeProfCacheKey = `batch-gradeprof-${courseSectionsWithProfs.length}-${term}`;
    const gradeProfHashKey = await generateCacheKey(gradeProfCacheKey);
    
    // Check grade/professor cache
    const cachedGradeProf = await getGenericCache(CACHE_KEYS.GRADE_PROF, gradeProfHashKey);
    
    if (cachedGradeProf) {
      AppLogger.info("Grade/professor cache hit for batch request");
      gradeProfData = JSON.parse(cachedGradeProf.combinedData);
      onProgress?.(70, "Found grade/professor data in cache");
    } else {
      // Fetch grade/professor data if not in cache
      onProgress?.(60, "Fetching grade/professor data from API");
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
        
        // Cache grade/professor data if useful data was returned
        if (gradeProfData && (gradeProfData.courses?.length || gradeProfData.profs?.length)) {
          await setGenericCache(CACHE_KEYS.GRADE_PROF, gradeProfHashKey, JSON.stringify(gradeProfData));
          onProgress?.(70, "Cached grade/professor data");
        }
      } catch (error) {
        AppLogger.error("Error fetching grade/professor data:", error);
        onProgress?.(70, `Error fetching grade/professor data: ${error}`);
        // Continue without grade/professor data
      }
    }
  }
  
  // Phase 5: Merge Data
  onProgress?.(80, "Merging course data");
  
  // Filter the grade/prof data to only include our requested courses/professors
  // to keep the cache size reasonable
  const filteredGradeProfData: BatchDataRequestResponse = {
    courses: [],
    profs: []
  };
  
  if (gradeProfData) {
    // Filter courses to only those we requested
    if (gradeProfData.courses && gradeProfData.courses.length > 0) {
      const relevantCourses = courseSectionsWithProfs.map(cs => cs.course_title);
      filteredGradeProfData.courses = gradeProfData.courses
        .filter(course => relevantCourses.includes(course.course_name));
    }
    
    // Filter professors to only those we requested
    if (gradeProfData.profs && gradeProfData.profs.length > 0) {
      const relevantProfessors = courseSectionsWithProfs.map(cs => cs.instructor_name);
      filteredGradeProfData.profs = gradeProfData.profs
        .filter(prof => relevantProfessors.includes(prof.master_name));
    }
  }
  
  // Merge data for each course
  const mergedData = mergeData(openCoursesCache, filteredGradeProfData, courseKeyMapping);
  
  // Log merged data details
  AppLogger.info(`[BATCH DEBUG] Merged data summary:`);
  Object.entries(mergedData).forEach(([key, data]) => {
    AppLogger.info(`[BATCH DEBUG] - Course ${key}:`);
    AppLogger.info(`[BATCH DEBUG]   - Title: ${data.title}`);
    AppLogger.info(`[BATCH DEBUG]   - Sections: ${data.sections?.length || 0}`);
    
    // Log details for each section
    if (data.sections && data.sections.length > 0) {
      data.sections.forEach((section, idx) => {
        AppLogger.info(`[BATCH DEBUG]   - Section ${idx+1}: ${section.section}, ClassNum: ${section.classNumber}`);
      });
    } else {
      AppLogger.info(`[BATCH DEBUG]   - No sections available after merge`);
    }
  });
  
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
    
    // Log results summary
    const resultKeys = Object.keys(batchResults);
    AppLogger.info(`[GEP DEBUG] Fetch complete. Found ${resultKeys.length} courses with data.`);
    
    // Log which courses have sections
    resultKeys.forEach(key => {
      const courseData = batchResults[key];
      const sectionCount = courseData.sections?.length || 0;
      AppLogger.info(`[GEP DEBUG] Course ${key}: ${sectionCount} sections found`);
    });
    
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
