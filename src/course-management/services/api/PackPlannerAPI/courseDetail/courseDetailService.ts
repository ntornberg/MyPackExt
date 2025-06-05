
import {generateCacheKey, getGenericCache, setGenericCache} from "../../../../cache/CourseRetrieval";
import {createGradeCard} from '../grade/gradeService';
import {createProfessorCard} from '../professor/ratingService';

import type {CourseElements, SingleCourseDataResponse} from '../../types';
import { AppLogger } from "../../../../../core/utils/logger";
import {SUPABASE_ANON_KEY, SUPABASE_URL} from "../../../../../core/config.ts";
import type {Course} from "../../../../../degree-planning/types/DataBaseResponses/SupaBaseResponseType.ts";


// Cache map to store course data in memory
const courseDataCache = new Map<string, SingleCourseDataResponse>();

/**
 * Fetches combined course and professor data from the backend API.
 * @param {Course} course - The course to fetch details for.
 * @returns {Promise<SingleCourseDataResponse | null>} - A promise that resolves with the combined data.
 */
async function fetchSingleCourseData(course: Course): Promise<SingleCourseDataResponse | null> {
  // Generate a cache key for this course
  const cacheKey = await generateCacheKey(course.abr + " " + course.instructor);
  
  // Check memory cache first
  if (courseDataCache.has(cacheKey)) {
    AppLogger.info("Memory cache hit for:", cacheKey);
    return courseDataCache.get(cacheKey)!;
  }
  
  // Generate hash for persistent cache lookup
  const hash = await generateCacheKey(course.abr + " " + course.instructor);
  
  // Check persistent cache
  const persistentCache = await getGenericCache("courseList", hash);
  AppLogger.info("Persistent cache:", persistentCache);
  if (persistentCache && persistentCache.combinedData) {
    try {
      const cachedData = JSON.parse(persistentCache.combinedData) as SingleCourseDataResponse;
      AppLogger.info("Persistent cache hit for:", cacheKey);
      
      // Store in memory cache for faster access next time
      courseDataCache.set(cacheKey, cachedData);
      
      return cachedData;
    } catch (error) {
      AppLogger.error("Error parsing cached data:", error);
      // Continue to API call if cache parsing fails
    }
  }
  
  // Fetch from API if not in cache
  try {
    AppLogger.info("Fetching combined data from API for:", course);
    const url = `${SUPABASE_URL}/functions/v1/database-access`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        courseName: course.abr,
        professorName: course.instructor
      })
    });
    
    
    if (!response.ok) {
      AppLogger.error("Error fetching combined data:", response.status, response.statusText);
      return null;
    }
    
    const combined_data_json = await response.json();
    
    const combinedData = {
      CourseData: combined_data_json.data.course? combined_data_json.data.course : null,
      RateMyProfInfo: combined_data_json.data.prof? combined_data_json.data.prof : null,
    } as SingleCourseDataResponse;
    // Store in memory cache

    courseDataCache.set(cacheKey, combinedData);
    
    // Generate hash and store in persistent cache
    const courseHash = await generateCacheKey(course.abr + " " + course.instructor);
    await setGenericCache("courseList", {hashKey : courseHash,cacheData : JSON.stringify(combinedData)});
    
    return combinedData;
  } catch (error) {
    AppLogger.error("Exception fetching combined data:", error);
    return null;
  }
}

/**
 * Fetches both course grade and professor details with a single API call.
 * @param {Course} course - The course to fetch details for.
 * @returns {Promise<CourseElements>} - A promise that resolves with both HTML elements.
 */
export async function getCourseAndProfessorDetails(course: Course): Promise<CourseElements> {
  AppLogger.info("Getting combined data for:", course.abr, course.instructor);
  
  try {
    const combinedData = await fetchSingleCourseData(course);
    
    let gradeElement: HTMLDivElement;
    let professorElement: HTMLDivElement;
    
    if (!combinedData) {
      // Create fallback elements if no data is available
      const gradeFallback = document.createElement("div");
      gradeFallback.textContent = "No grade data available.";
      gradeElement = gradeFallback;
      
      const profFallback = document.createElement("div");
      profFallback.textContent = "Professor not found.";
      professorElement = profFallback;
    } else {
      // Create both elements from the same API response
      gradeElement = createGradeCard(course, combinedData);
      professorElement = createProfessorCard(course, combinedData);
    }
    
    return {
      gradeElement,
      professorElement
    };
  } catch (error) {
    AppLogger.error("Exception while creating course elements:", error);
    
    // Create error elements
    const gradeErrorElement = document.createElement("div");
    gradeErrorElement.textContent = "Error loading grade data.";
    
    const profErrorElement = document.createElement("div");
    profErrorElement.textContent = "Error loading professor data.";
    
    return {
      gradeElement: gradeErrorElement,
      professorElement: profErrorElement
    };
  }
} 