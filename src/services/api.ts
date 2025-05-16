import { createRoot } from 'react-dom/client';
import type { Course, GradeData, MatchedRateMyProf } from '../types';
import { AppLogger } from '../utils/logger';
import { createShadowHost } from '../utils/dom';
import { GradeCard } from '../components/GradeCard';
import { ProfRatingCard } from '../components/ProfRatingCard';
import React from "react";
import { getGenericCache, setGenericCache, generateCacheKey } from "../cache/CourseRetrieval.tsx";

// Interface for combined API response
interface CombinedApiResponse {
  CourseData: {
    unique_hash: string | null;
    subject: string | null;
    course_name: string | null;
    instructor_name: string | null;
    a_average: string | null;
    b_average: string | null;
    c_average: string | null;
    d_average: string | null;
    f_average: string | null;
    class_avg_max: string | null;
    class_avg_min: string | null;
  };
  RateMyProfInfo: {
    master_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avgRating: number | null;
    department: string | null;
    school: string | null;
    id: string | null;
  };
}

// Cache map to store course data in memory
const courseDataCache = new Map<string, CombinedApiResponse>();

/**
 * Fetches combined course and professor data from the backend API.
 * @param {Course} course - The course to fetch details for.
 * @returns {Promise<CombinedApiResponse>} - A promise that resolves with the combined data.
 */
async function fetchCombinedData(course: Course): Promise<CombinedApiResponse | null> {
  // Generate a cache key for this course
  const cacheKey = await generateCacheKey(course.abr + " " + course.instructor );
  
  // Check memory cache first
  if (courseDataCache.has(cacheKey)) {
    AppLogger.info("Memory cache hit for:", cacheKey);
    return courseDataCache.get(cacheKey)!;
  }
  
  // Generate hash for persistent cache lookup
  const hash = await generateCacheKey(course.abr + " " + course.instructor );
  
  // Check persistent cache
  const persistentCache = await getGenericCache("courseList", hash);
  if (persistentCache && persistentCache.combinedData) {
    try {
      const cachedData = JSON.parse(persistentCache.combinedData) as CombinedApiResponse;
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
    const url = `https://app-gradefetchbackend.azurewebsites.net/api/FetchGradeData?courseName=${encodeURIComponent(course.abr)}&professorName=${encodeURIComponent(course.instructor)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      AppLogger.error("Error fetching combined data:", response.status, response.statusText);
      return null;
    }
    
    const combinedData = await response.json() as CombinedApiResponse;
    
    // Store in memory cache
    courseDataCache.set(cacheKey, combinedData);
    
    // Generate hash and store in persistent cache
    const courseHash = await generateCacheKey(course.abr + " " + course.instructor );
    await setGenericCache("courseList", courseHash, JSON.stringify(combinedData));
    
    return combinedData;
  } catch (error) {
    AppLogger.error("Exception fetching combined data:", error);
    return null;
  }
}

/**
 * Creates a grade card component from course data.
 * @param {Course} course - The course to create the grade card for.
 * @param {CombinedApiResponse} data - The data to use for the card.
 * @returns {HTMLDivElement} - The HTML element containing the grade card.
 */
function createGradeCard(course: Course, data: CombinedApiResponse): HTMLDivElement {
  const { host: wrapper, container } = createShadowHost("mypack-extension-data-grade");
  wrapper.style.marginTop = "0.5rem";
  wrapper.style.overflow = 'visible';
  wrapper.style.maxWidth = "400px";
  wrapper.style.display = 'inline-block';
  wrapper.style.verticalAlign = 'top';

  const courseData = data.CourseData;
  
  // Extract and parse grade data
  const a = parseFloat(courseData.a_average ?? "0");
  const b = parseFloat(courseData.b_average ?? "0");
  const c = parseFloat(courseData.c_average ?? "0");
  const d = parseFloat(courseData.d_average ?? "0");
  const f = parseFloat(courseData.f_average ?? "0");

  // Check if there's any valid grade data
  const total = a + b + c + d + f;
  if (!total || isNaN(total)) {
    wrapper.textContent = "No grade data available.";
    return wrapper;
  }

  // Prepare grade data for the component
  const gradeData: GradeData = {
    courseName: courseData.course_name ?? course.abr,
    subject: courseData.subject ?? "",
    instructorName: courseData.instructor_name ?? course.instructor,
    aAverage: a,
    bAverage: b,
    cAverage: c,
    dAverage: d,
    fAverage: f,
    classAverageMin: courseData.class_avg_min ? parseFloat(courseData.class_avg_min) : 0,
    classAverageMax: courseData.class_avg_max ? parseFloat(courseData.class_avg_max) : 0,
  };

  // Render the grade card component
  const root = createRoot(container);
  root.render(React.createElement(GradeCard, gradeData));
  
  return wrapper;
}

/**
 * Creates a professor rating card component from course data.
 * @param {Course} course - The course to create the rating card for.
 * @param {CombinedApiResponse} data - The data to use for the card.
 * @returns {HTMLDivElement} - The HTML element containing the rating card.
 */
function createProfessorCard(course: Course, data: CombinedApiResponse): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.id = "mypack-extension-data-prof";
  wrapper.style.marginTop = "0.5rem";
  wrapper.style.overflow = 'visible';
  wrapper.style.maxWidth = "400px";
  wrapper.style.display = 'inline-block';
  wrapper.style.verticalAlign = 'top';

  const profInfo = data.RateMyProfInfo;
  
  // Check if there's any valid professor data
  if (!profInfo || (!profInfo.avgRating && !profInfo.master_name && !profInfo.first_name && !profInfo.last_name)) {
    wrapper.textContent = "Professor not found.";
    return wrapper;
  }

  // Prepare professor data for the component
  const profData: MatchedRateMyProf = {
    master_name: profInfo.master_name ?? course.instructor,
    first_name: profInfo.first_name,
    last_name: profInfo.last_name,
    avgRating: profInfo.avgRating,
    department: profInfo.department,
    school: profInfo.school,
    id: profInfo.id,
  };

  // Render the professor rating card component
  const root = createRoot(wrapper);
  root.render(React.createElement(ProfRatingCard, profData));
  
  return wrapper;
}

/**
 * Interface for both grade and professor elements
 */
export interface CourseElements {
  gradeElement: HTMLDivElement;
  professorElement: HTMLDivElement;
}

/**
 * Fetches both course grade and professor details with a single API call.
 * @param {Course} course - The course to fetch details for.
 * @returns {Promise<CourseElements>} - A promise that resolves with both HTML elements.
 */
export async function getCourseAndProfessorDetails(course: Course): Promise<CourseElements> {
  AppLogger.info("Getting combined data for:", course.abr, course.instructor);
  
  try {
    const combinedData = await fetchCombinedData(course);
    
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

