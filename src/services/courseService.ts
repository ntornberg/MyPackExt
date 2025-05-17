import { AppLogger } from '../utils/logger';
import { parseHTMLContent, formCourseURL } from '../utils/courseUtils';
import type { Course } from '../types/Plans';

export async function searchOpenCourses(term: string, course: Course) {
    try {
        AppLogger.info('Searching open courses for', { term, course });
        const formData = formCourseURL(term, course.course_abr, course.catalog_num);
        if (!formData) {
            AppLogger.warn('Aborting searchOpenCourses: formData is null (subject missing)', { term, course });
            return null;
        }
        function sendMessage() : Promise<any>{ 
            return new Promise((resolve, _) => {
                chrome.runtime.sendMessage({
                    type: "fetchData",
                    url: "https://webappprd.acs.ncsu.edu/php/coursecat/search.php",
                    formData: formData,
                    course: course
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
        AppLogger.info('Received response text', response_string);
        if (response_string != null && !response_string.error) {
            return parseHTMLContent(response_string);
        }
    } catch (error) {
        AppLogger.error('Error in searchOpenCourses', error);
    }
    return null;
} 