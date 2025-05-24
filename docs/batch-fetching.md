# Batch Course Fetching with Separated Caching

This document explains the batch course fetching capability implemented in the `batchFetchCoursesData` function in the `dataService.ts` file.

## Overview

The batch fetching feature improves performance and efficiency when retrieving data for multiple courses by:

1. Checking separate caches for open courses and grade/professor data
2. Making a single API call for all uncached courses and professors
3. Efficiently merging and caching results by data type

## Caching Strategy

The implementation uses two separate caches:

1. **Open Courses Cache** - Stores basic course and section information
2. **Grade/Professor Cache** - Stores professor ratings and grade distributions

This separation provides several benefits:
- Each data type can be updated independently
- If course availability changes but grades don't, only one cache needs updating
- Better cache hit rates since one type of data might be available while the other isn't

## How It Works

The process follows these steps:

1. **Open Courses Cache Check**: Check the open courses cache for all requested courses
2. **Open Courses Fetching**: For cache misses, fetch open courses data from the course API
3. **Grade/Professor Cache Check**: Check the grade/professor cache for all courses with instructors
4. **Batch Grade/Professor API Call**: Make a single API call for all uncached professor data
5. **Merge and Cache**: Merge the results and store in appropriate caches

## Implementation Details

### 1. Cache Keys and Namespaces

```typescript
const CACHE_KEYS = {
  OPEN_COURSES: "openCourses",
  GRADE_PROF: "gradeProfData"
};
```

### 2. Open Courses Cache Checking (Parallel)

```typescript
// Generate cache keys and prepare lookup data
const courseKeyMapping: Record<string, RequiredCourse> = {};
const openCoursesCache: Record<string, CourseData> = {};
const openCoursesToFetch: RequiredCourse[] = [];
const openCoursesHashKeys: Record<string, string> = {};

// Check open courses cache in parallel
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
```

### 3. Fetching Missing Open Courses

```typescript
// Fetch all missing open courses in parallel
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
```

### 4. Grade/Professor Cache Checking

```typescript
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
```

### 5. Single API Call for Professor/Grade Data

```typescript
// Only make API call if there are sections to fetch
if (sectionsToFetch.length > 0) {
  const url = `https://app-gradefetchbackend.azurewebsites.net/api/user/allCourses`;
  const apiResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(sectionsToFetch)
  });
  
  batchGradeProfData = await apiResponse.json() as BatchDataRequestResponse;
  
  // Store in the cache for each course
  for (const [courseKey, sections] of Object.entries(courseKeyToSections)) {
    if (sections.length > 0 && !gradeProfCache[courseKey]) {
      const hashKey = gradeProfHashKeys[courseKey];
      if (hashKey && batchGradeProfData) {
        await setGenericCache(CACHE_KEYS.GRADE_PROF, hashKey, JSON.stringify(batchGradeProfData));
        gradeProfCache[courseKey] = batchGradeProfData;
      }
    }
  }
}
```

### 6. Final Data Merging

```typescript
// Merge data for each course
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
```

## Performance Benefits

This approach offers significant performance improvements:

1. **Separated Caching**: Different types of data can be cached independently
2. **Reduced API Calls**: Only uncached data is fetched from the API
3. **Parallel Processing**: Cache checks and data fetching happen in parallel
4. **Optimized Updates**: Changes to one data type don't invalidate other cached data
5. **Batch API Requests**: Multiple professor/grade requests are batched into a single API call

## Usage Example

```typescript
// Define the courses to fetch
const courses: RequiredCourse[] = [
  { course_abr: 'CSC', catalog_num: '316', course_id: '1234', course_descrip: 'Data Structures' },
  { course_abr: 'MA', catalog_num: '242', course_id: '1236', course_descrip: 'Calculus III' }
];

// Call the batch function with progress reporting
const results = await batchFetchCoursesData(
  courses, 
  term,
  (progress, message) => {
    console.log(`Progress: ${progress}% - ${message || 'Working...'}`);
  }
);
```

This batch processing approach with separated caching has been integrated into the `fetchCourseSearchData` and `fetchGEPCourseData` functions, improving the overall performance and flexibility of course searches in the application. 