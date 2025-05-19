import type { BatchDataRequestResponse } from "../../services/api";
import type { MatchedRateMyProf, GradeData } from "../../types";
import { AppLogger } from "../logger";
import type { CourseData, CourseSection } from "./ParseRegistrarUtil";

type ModifiedSection = CourseSection & {
    grade_distribution?: GradeData;
    professor_rating?: MatchedRateMyProf;
}

export type MergedCourseData = Omit<CourseData, "sections"> & {
    sections: ModifiedSection[];
}

export function mergeData(courses: Record<string, CourseData>, batchData: BatchDataRequestResponse) {
    AppLogger.info("Merging data");
    AppLogger.info("Batch data: ", batchData);
    AppLogger.info("Courses: ", courses);
    const mergedData: Record<string, MergedCourseData> = {};
    for (const [courseKey, course] of Object.entries(courses)) {
        const mergedCourse: MergedCourseData = {
            ...course,
            sections: []
        }
        for (const section of course.sections) {
            const batchCourse = batchData.courses?.find((gradeData) =>{
                if (gradeData.instructor_name === section.instructor_name[0] &&
                    gradeData.course_name === course.code) {
                    AppLogger.info("Matched ",gradeData.instructor_name," ",section.instructor_name[0])
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
            if (batchCourse || profData) {
                mergedCourse.sections.push({
                    ...section,
                    grade_distribution: correctedCourse,
                    professor_rating: profData
                });
            } else {
                mergedCourse.sections.push({
                    ...section
                });
            }
        }
        mergedData[courseKey] = mergedCourse;
    }
    AppLogger.info("Merged data: ", mergedData);
    return mergedData;
}
