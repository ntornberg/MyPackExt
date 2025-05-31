import type { GradeData } from "../../../types";
import type { RootObject } from "../../../utils/GradientWorker/GradientRequestRawResponseType";
import { AppLogger } from "../../../utils/logger";

export function parseGradientResponse(subject: string,course: string,response: RootObject): GradeData[] {
    AppLogger.info("Parsing gradient response for:", response);
    const courses: Record<string, {a_total: number | null, b_total: number | null, c_total: number | null, d_total: number | null, f_total: number | null,total: number | null}[]> = {}; // Instructor name -> grade data
    if(!response.individual){
        return [];
    }
    response.individual.forEach((course) => {
        AppLogger.info("Course:", course);
        if(courses[course.instructorName]){
            courses[course.instructorName].push({a_total: course.grades.A? course.grades.A.raw : null, b_total: course.grades.B? course.grades.B.raw : null, c_total: course.grades.C? course.grades.C.raw : null, d_total: course.grades.D? course.grades.D.raw : null, f_total: course.grades.F? course.grades.F.raw : null,total: course.grades.TOTAL? course.grades.TOTAL.raw : null});
        }else{
            courses[course.instructorName] = [{a_total: course.grades.A? course.grades.A.raw : null, b_total: course.grades.B? course.grades.B.raw : null, c_total: course.grades.C? course.grades.C.raw : null, d_total: course.grades.D? course.grades.D.raw : null, f_total: course.grades.F? course.grades.F.raw : null,total: course.grades.TOTAL? course.grades.TOTAL.raw : null}];
        }
    });
    const course_data: GradeData[] = [];
    AppLogger.info("Courses:", courses);
    for(const [instructor, grades] of Object.entries(courses)){
       const a_total = grades.reduce((acc, curr) => acc + (curr.a_total ?? 0), 0);
       const b_total = grades.reduce((acc, curr) => acc + (curr.b_total ?? 0), 0);
       const c_total = grades.reduce((acc, curr) => acc + (curr.c_total ?? 0), 0);
       const d_total = grades.reduce((acc, curr) => acc + (curr.d_total ?? 0), 0);
       const f_total = grades.reduce((acc, curr) => acc + (curr.f_total ?? 0), 0);
       const total = grades.reduce((acc, curr) => acc + (curr.total ?? 0), 0);
       const a_average = a_total / total;
       const b_average = b_total / total;
       const c_average = c_total / total;
       const d_average = d_total / total;
       const f_average = f_total / total;
       AppLogger.info("Averages:", a_average, b_average, c_average, d_average, f_average);
       AppLogger.info("A_total:", a_total, "B_total:", b_total, "C_total:", c_total, "D_total:", d_total, "F_total:", f_total);
       AppLogger.info("Total:", total);
       const classAvgMax = 100 * a_average + 89 * b_average + 79 * c_average + 69 * d_average + 59 * f_average;
       const classAvgMin = 90 * a_average + 80 * b_average + 70 * c_average + 60 * d_average + 50 * f_average;
if(total > 0){
       course_data.push({
        course_name: `${subject} ${course}`,
        subject: subject,
        instructor_name: instructor,
        a_average,
        b_average,
        c_average,
        d_average,
        f_average,
        class_avg_max: classAvgMax,
        class_avg_min: classAvgMin
    });
}
    }
AppLogger.info("Course data:", course_data);
    return course_data;
}