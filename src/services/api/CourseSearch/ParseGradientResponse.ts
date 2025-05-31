import type { GradeData } from "../../../types";
import type { RootObject } from "../../../utils/GradientWorker/GradientRequestRawResponseType";

export function parseGradientResponse(subject: string,course: string,response: RootObject): GradeData[] {
    const courses: Record<string, {a_total: number, b_total: number, c_total: number, d_total: number, f_total: number,total: number}[]> = {}; // Instructor name -> grade data
    response.individual.forEach((course) => {
        if(courses[course.instructorName]){
            courses[course.instructorName].push({a_total: course.grades.a_total.raw, b_total: course.grades.b_total.raw, c_total: course.grades.c_total.raw, d_total: course.grades.d_total.raw, f_total: course.grades.f_total.raw,total: course.grades.total.raw});
        }else{
            courses[course.instructorName] = [{a_total: course.grades.a_total.raw, b_total: course.grades.b_total.raw, c_total: course.grades.c_total.raw, d_total: course.grades.d_total.raw, f_total: course.grades.f_total.raw,total: course.grades.total.raw}];
        }
    });
    const course_data: GradeData[] = [];
    for(const [instructor, grades] of Object.entries(courses)){
       const a_total = grades.reduce((acc, curr) => acc + curr.a_total, 0);
       const b_total = grades.reduce((acc, curr) => acc + curr.b_total, 0);
       const c_total = grades.reduce((acc, curr) => acc + curr.c_total, 0);
       const d_total = grades.reduce((acc, curr) => acc + curr.d_total, 0);
       const f_total = grades.reduce((acc, curr) => acc + curr.f_total, 0);
       const total = grades.reduce((acc, curr) => acc + curr.total, 0);
       const a_average = a_total / total;
       const b_average = b_total / total;
       const c_average = c_total / total;
       const d_average = d_total / total;
       const f_average = f_total / total;
       const classAvgMax = 100 * a_average + 89 * b_average + 79 * c_average + 69 * d_average + 59 * f_average;
       const classAvgMin = 90 * a_average + 80 * b_average + 70 * c_average + 60 * d_average + 50 * f_average;

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

    return course_data;
}