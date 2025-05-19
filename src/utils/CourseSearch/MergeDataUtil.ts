import type { BatchDataRequestResponse } from "../../services/api";
import type { MatchedRateMyProf, GradeData } from "../../types";
import type { CourseData, CourseSection } from "./ParseRegistrarUtil";

type ModifiedSection = CourseSection & {
    profs?: MatchedRateMyProf;
    grade_distribution?: GradeData;
    professor_rating?: MatchedRateMyProf;
}

export type MergedCourseData = Omit<CourseData, "sections"> & {
    sections: ModifiedSection[];
}

export function mergeData(courses: Record<string, CourseData>, batchData: BatchDataRequestResponse) {
    const mergedData: Record<string, MergedCourseData> = {};
    for (const [courseKey, course] of Object.entries(courses)) {
        const mergedCourse: MergedCourseData = {
            ...course,
            sections: []
        }
        for (const section of course.sections) {
            const batchCourse = batchData.courses?.find((gradeData) =>{
                if (gradeData.instructorName === section.instructor_name[0]) {
                    return gradeData;
                }
                return null;
            });
            
            const profData = batchData.profs?.filter((prof) => 
                prof.master_name === section.instructor_name[0]
            )[0];
            
            if (batchCourse || profData) {
                mergedCourse.sections.push({
                    ...section,
                    grade_distribution: batchCourse,
                    profs: profData,
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
    return mergedData;
}
