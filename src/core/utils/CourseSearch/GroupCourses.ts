import type {RequiredCourse} from "../../../degree-planning/types/Plans";

export function GroupCourses(courses : RequiredCourse[]){
    const grouped = courses.reduce((groupedArray : Record<string,RequiredCourse[]> ,item)=>{
        if(!groupedArray[item.course_abr]){
            groupedArray[item.course_abr] = [];
        }
        groupedArray[item.course_abr].push(item);
        return groupedArray
    }, {});
    return grouped;
}