import { AppLogger } from '../../../utils/logger';
import { parseHTMLContent, formCourseURL } from '../../../utils/CourseSearch/ParseRegistrarUtil';
import type { RequiredCourse } from '../../../types/Plans';
import type { CourseData } from '../../../utils/CourseSearch/ParseRegistrarUtil';

/**
 * Searches for open course sections based on term and course abbreviation/catalog number
 * @param term The academic term to search in
 * @param courseAbr Course abbreviation (e.g., "CSC")
 * @param catalogNum Catalog number (e.g., "316")
 * @returns CourseData or null if not found or error
 */
export async function searchOpenCoursesByParams(
    term: string, 
    courseAbr: string, 
    catalogNum: string
    
): Promise<CourseData | null> {
    try {
        AppLogger.info('Searching open courses for', { term, courseAbr, catalogNum });
        const formData = formCourseURL(term, courseAbr, catalogNum);
        
        if (!formData) {
            AppLogger.warn('Aborting searchOpenCourses: formData is null (subject missing)', { term, courseAbr, catalogNum });
            return null;
        }
        
        function sendMessage(): Promise<any> { 
            return new Promise((resolve, _) => {
                chrome.runtime.sendMessage({
                    type: "fetchData",
                    url: "https://webappprd.acs.ncsu.edu/php/coursecat/search.php",
                    formData: formData,
                }, (response) => {
                    resolve(response);
                });
            });
        }
        
        const response_string = await sendMessage();
        
        if (response_string == null) {
            AppLogger.warn('Received null response from background fetch');
        } else if (response_string && response_string.error) {
            AppLogger.error('Error in background fetch:', response_string.error);
        }
        
        if (response_string != null && !response_string.error) {
            const parsed = parseHTMLContent(response_string);
            if(Array.isArray(parsed)){
                return parsed[0];
            }else if(parsed){
                return parsed;
            }else{
                return null;
            }
     
        }
    } catch (error) {
        AppLogger.error('Error in searchOpenCourses', error);
    }
    
    return null;
}
export async function batchSearchOpenCourses(
    term: string, 
    subject: string
    
): Promise<CourseData[] | CourseData | null> {
    try {
        AppLogger.info('Searching open courses for', { term, subject });
        const formData = formCourseURL(term, subject, null);
        
        if (!formData) {
            AppLogger.warn('Aborting searchOpenCourses: formData is null (subject missing)', { term, subject });
            return null;
        }
        
        function sendMessage(): Promise<any> { 
            return new Promise((resolve, _) => {
                chrome.runtime.sendMessage({
                    type: "fetchData",
                    url: "https://cloudflareworker.nicktornberg12.workers.dev/",
                    formData: formData,
                }, (response) => {
                    resolve(response);
                });
            });
        }
                    
        const response_string = await sendMessage();
        
        if (response_string == null) {
            AppLogger.warn('Received null response from background fetch');
        } else if (response_string && response_string.error) {
            AppLogger.error('Error in background fetch:', response_string.error);
        }
        
        if (response_string != null && !response_string.error) {
            return parseHTMLContent(response_string);
        }
    } catch (error) {
        AppLogger.error('Error in searchOpenCourses', error);
    }
    
    return null;
}
/**
 * This fucntion needs to go
 * @deprecated
 * @param term The academic term to search in
 * @param course The course requirement details
 * @returns CourseData or null if not found or error
 */
export async function searchOpenCourses(term: string, course: RequiredCourse): Promise<CourseData | null> {
    return searchOpenCoursesByParams(term, course.course_abr, course.catalog_num);
} 