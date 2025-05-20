import { createRoot } from 'react-dom/client';
import type { Course, GradeData, MatchedRateMyProf } from '../types';
import { AppLogger } from '../utils/logger';
import { createShadowHost } from '../utils/dom';
import { GradeCard } from '../components/DegreeAuditCards/GradeCard.tsx';
import { ProfRatingCard } from '../components/DegreeAuditCards/ProfRatingCard.tsx';
import React from "react";
import { getGenericCache, setGenericCache, generateCacheKey } from "../cache/CourseRetrieval.tsx";
import type { RequiredCourse, Requirement } from '../types/Plans.ts';
import type { CourseData } from '../utils/CourseSearch/ParseRegistrarUtil.ts';
import { searchOpenCourses } from './courseService.ts';
import { mergeData, type MergedCourseData } from '../utils/CourseSearch/MergeDataUtil.ts';

// Interface for combined API response
interface SingleCourseDataResponse {
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
export interface BatchDataRequestResponse {
  courses?: GradeData[];
  profs?: MatchedRateMyProf[];
}


// Cache map to store course data in memory
const courseDataCache = new Map<string, SingleCourseDataResponse>();

/**
 * Fetches combined course and professor data from the backend API.
 * @param {Course} course - The course to fetch details for.
 * @returns {Promise<SingleCourseDataResponse>} - A promise that resolves with the combined data.
 */
async function fetchSingleCourseData(course: Course): Promise<SingleCourseDataResponse | null> {
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
    const url = `https://app-gradefetchbackend.azurewebsites.net/api/user/singleCourse?courseName=${encodeURIComponent(course.abr)}&professorName=${encodeURIComponent(course.instructor)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      AppLogger.error("Error fetching combined data:", response.status, response.statusText);
      return null;
    }
    
    const combinedData = await response.json() as SingleCourseDataResponse;
    
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
 * Fetches course search data from the backend API.
 * @param {Requirement[]} requirements - The requirements to fetch data for.
 * @param {string} term - The term to fetch data for.
 * @returns {Promise<Record<string, CourseData>>} - A promise that resolves with the course data.
 */
export async function fetchCourseSearchData(requirements : Requirement[],term: string){
  const cached_courses :  Record<string, MergedCourseData> = {}
  const new_courses : Record<string, CourseData> = {}
  
  // Create a map of course keys to RequiredCourse objects for passing course_id to sections
  const courseInfoMap: Record<string, RequiredCourse> = {};
  
  for(const rq of Object.values(requirements) as Requirement[]){
    for(const course of rq.courses as RequiredCourse[]){
      const courseKey = `${course.course_abr}-${course.catalog_num}`;
      
      AppLogger.info("Fetching course data for:", courseKey + ' ' + term);
      const cacheKey = courseKey + ' ' + term; 
      courseInfoMap[courseKey] = course; // Store with readable key for later lookup
      
      // Generate hash for persistent cache lookup
      const hashKey = await generateCacheKey(cacheKey);
      
      const cachedCourse = await getGenericCache("openCourses", hashKey);
      if (cachedCourse) {
          AppLogger.info("Cache hit for:", cacheKey);
          cached_courses[courseKey] = JSON.parse(cachedCourse.combinedData);
          continue;
      }
      
      AppLogger.info("Cache miss for:", cacheKey, "fetching from API");
      const response = await searchOpenCourses(term ?? "", course);
      
      if(response){
        new_courses[courseKey] = response;
      }
      
    }
    }

  if(Object.keys(new_courses).length > 0){
    const courses_to_fetch = Object.entries(new_courses).flatMap(([_, course]) => {
      return course.sections
        .filter(section => section.instructor_name.length > 0 && course.code.length > 0)
        .map(section => ({
          course_title: course.code,
          instructor_name: section.instructor_name[0]
        }));
    });
  const url = `https://app-gradefetchbackend.azurewebsites.net/api/user/allCourses`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courses_to_fetch)
    });
    
    if (!response.ok) {
      AppLogger.error("Error fetching combined data:", response.status, response.statusText);
      return null;
    }

    const combinedData = await response.json() as BatchDataRequestResponse
    const mergedData = mergeData(new_courses, combinedData, courseInfoMap);
  
    // Store data in cache with consistent keys
    for(const [courseKey, course] of Object.entries(mergedData)){
      const cacheKey = courseKey + ' ' + term;
      const hashKey = await generateCacheKey(cacheKey);
      AppLogger.info("Storing in cache:", cacheKey, "with hash:", hashKey);
      await setGenericCache("openCourses", hashKey, JSON.stringify(course));
    }
    
    for(const [courseKey, course] of Object.entries(cached_courses)){
      mergedData[courseKey] = course;
    }
    AppLogger.info('mergedData', mergedData);
    return mergedData;
  }
  AppLogger.info('cached_courses', cached_courses);
    return cached_courses;
}

/**
 * Creates a grade card component from course data.
 * @param {Course} course - The course to create the grade card for.
 * @param {SingleCourseDataResponse} data - The data to use for the card.
 * @returns {HTMLDivElement} - The HTML element containing the grade card.
 */
function createGradeCard(course: Course, data: SingleCourseDataResponse): HTMLDivElement {
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
    course_name: courseData.course_name ?? course.abr,
    subject: courseData.subject ?? "",
    instructor_name: courseData.instructor_name ?? course.instructor,
    a_average: a,
    b_average: b,
    c_average: c,
    d_average: d,
    f_average: f,
    class_avg_min: courseData.class_avg_min ? parseFloat(courseData.class_avg_min) : 0,
    class_avg_max: courseData.class_avg_max ? parseFloat(courseData.class_avg_max) : 0,
  };

  // Render the grade card component
  const root = createRoot(container);
  root.render(React.createElement(GradeCard, gradeData));
  
  return wrapper;
}

/**
 * Creates a professor rating card component from course data.
 * @param {Course} course - The course to create the rating card for.
 * @param {SingleCourseDataResponse} data - The data to use for the card.
 * @returns {HTMLDivElement} - The HTML element containing the rating card.
 */
function createProfessorCard(course: Course, data: SingleCourseDataResponse): HTMLDivElement {
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

