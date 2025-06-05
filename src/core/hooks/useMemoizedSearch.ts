import {useCallback, useRef, useState} from 'react';
import type {MergedCourseData} from '../utils/CourseSearch/MergeDataUtil';


type ProgressCallback = (progress: number, message?: string) => void;

type SearchCache = {
  [key: string]: MergedCourseData;
};

export const useMemoizedSearch = (
  searchFunction: (
    courseAbr: string,
    catalogNum: string,
    course_id: string,
    term: string,
    onProgress?: ProgressCallback
  ) => Promise<MergedCourseData | null>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [data, setData] = useState<MergedCourseData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Cache for search results
  const cacheRef = useRef<SearchCache>({});

  const search = useCallback(
    async (
      subject: string | null,
      course: string | null, 
      courseId: string,
      term: string | null
    ) => {
      if (!subject || !course || !term) {
        return null;
      }

      setIsLoading(true);
      setProgress(10);
      setProgressLabel('Initializing search...');
      setError(null);

      try {
        // Create a cache key from the search parameters
        const cacheKey = `${subject}:${course}:${term}`;
        
        // Check if we have this search cached
        if (cacheRef.current[cacheKey]) {
          setProgress(100);
          setProgressLabel('Retrieved from cache');
          setData(cacheRef.current[cacheKey]);
          return cacheRef.current[cacheKey];
        }
        
        setProgress(20);
        setProgressLabel(`Searching for ${course} in ${term}`);
        
        const result = await searchFunction(
          subject,
          course,
          courseId,
          term,
          (progressValue, statusMessage) => {
            setProgress(20 + Math.round(progressValue * 0.75));
            if (statusMessage) {
              setProgressLabel(statusMessage);
            }
          }
        );
        
        // Only store in cache if we have data
        if (result) {
          cacheRef.current[cacheKey] = result;
          setData(result);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        return null;
      } finally {
        setProgress(100);
        setProgressLabel('Complete');
        setIsLoading(false);
      }
    },
    [searchFunction]
  );

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  return {
    search,
    clearCache,
    isLoading,
    progress,
    progressLabel,
    data,
    error
  };
}; 