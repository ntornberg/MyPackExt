import type { BatchDataRequestResponse } from "../../services/api";
import type { MatchedRateMyProf, GradeData } from "../../types";
import type { RequiredCourse } from "../../types/Plans";
import { AppLogger } from "../logger";
import type { CourseData, CourseSection } from "./ParseRegistrarUtil";

export type ModifiedSection = CourseSection & {
    grade_distribution?: GradeData;
    professor_rating?: MatchedRateMyProf;
    // Cart functionality fields
    course_id?: string;
    catalog_nbr?: string;
    course_career?: string;
    session_code?: string;
    grading_basis?: string;
    rqmnt_designtn?: string;
    wait_list_okay?: string;
    courseData?: CourseData; // Reference to parent course for easy access
}

export type MergedCourseData = Omit<CourseData, "sections"> & {
    sections: ModifiedSection[];
    course_id?: string; // Store course_id at course level
}

export function mergeData(
    courses: Record<string, CourseData>, 
    batchData: BatchDataRequestResponse,
    courseInfoMap?: Record<string, RequiredCourse> // Map of course keys to RequiredCourse containing course_id
) {
    AppLogger.info("Merging data");
    AppLogger.info("Batch data: ", batchData);
    AppLogger.info("Courses: ", courses);
    AppLogger.info("Course info map: ", courseInfoMap);
    const mergedData: Record<string, MergedCourseData> = {};
    for (const [cacheKey, course] of Object.entries(courses)) {
        // Get the courseKey (e.g., "CSC-316")
        const reqCourse = courseInfoMap?.[cacheKey];
        if(!reqCourse){
            AppLogger.warn("Required course not found for course: ",course);
            AppLogger.warn("Course key: ",cacheKey);
        }

        
        const mergedCourse: MergedCourseData = {
            ...course,
            sections: [],
            course_id: reqCourse?.course_id // Store course_id from RequiredCourse
        }
        
        // Extract catalog number from course code (e.g., "CSC 316" -> "316")
        const codeParts = course.code.split(' ');
        const catalog_nbr = codeParts.length > 1 ? codeParts[1] : '';
        
        for (const section of course.sections) {

            const batchCourse = batchData.courses?.find((gradeData) =>{
                if (gradeData.instructor_name === section.instructor_name[0] &&
                    gradeData.course_name === course.code) {
                  
                    return gradeData;
                }
                return null;
            });
            
            const profData = batchData.profs?.filter((prof) => 
                prof.master_name === section.instructor_name[0]
            )[0];
            let correctedCourse: GradeData | undefined = undefined;
            if(batchCourse){
                correctedCourse = {
                    ...batchCourse,
                    a_average: parseFloat(String(batchCourse.a_average ?? "0")),
                    b_average: parseFloat(String(batchCourse.b_average ?? "0")),
                    c_average: parseFloat(String(batchCourse.c_average ?? "0")),
                    d_average: parseFloat(String(batchCourse.d_average ?? "0")),
                    f_average: parseFloat(String(batchCourse.f_average ?? "0")),
                    class_avg_min: parseFloat(String(batchCourse.class_avg_min ?? "0")),
                    class_avg_max: parseFloat(String(batchCourse.class_avg_max ?? "0")),
                }
            }
            // Add cart functionality fields to section
            const modifiedSection: ModifiedSection = {
                ...section,
                grade_distribution: correctedCourse,
                professor_rating: profData,
                // Cart functionality fields with default values
                course_id: reqCourse?.course_id,
                catalog_nbr,
                course_career: 'UGRD', // Default for undergraduate
                session_code: '1', // Default session
                grading_basis: 'GRD', // Default grading basis
                rqmnt_designtn: '', // Default requirement designation
                wait_list_okay: 'N', // Default waitlist setting
                courseData: course // Reference to parent course
            };
            if (batchCourse || profData) {
                mergedCourse.sections.push(modifiedSection);
            } else {
                mergedCourse.sections.push(modifiedSection);
            }
        }
        mergedData[cacheKey] = mergedCourse;
    }
    AppLogger.info("Merged data: ", mergedData);
    return mergedData;
}
