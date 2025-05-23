import type { RequiredCourse } from "../../types/Plans";
import type { MergedCourseData } from '../../utils/CourseSearch/MergeDataUtil';
import { TermIdByName } from '../../Data/TermID';
export type CourseSearchData = {
    selectedTerm: string | null;
    searchSubject: string | null;
    searchCourse: string | null;
    selectedCourseInfo: {code: string | null, catalogNum: string | null, title: string | null, id: string};
}
export const CourseSearchDataInitialState: CourseSearchData = {
    selectedTerm: Object.keys(TermIdByName)[0],
    searchSubject: null,
    searchCourse: null,
    selectedCourseInfo: {code: null, catalogNum: null, title: null, id: ''}
}
export type PlanSearchData = {
    open: Record<string, boolean>
    selectedMajor: string | null;
    selectedTerm: string | null;
    selectedMinor: string | null;
    selectedSubplan: string | null;
    searchMajor: string | null;
    searchSubplan: string | null;
    searchMinor: string | null;
    openCourses: Record<string, MergedCourseData> | {};
    isLoaded: boolean;
    progress: number | 0;
    progressLabel: string | null;
    hideNoSections: boolean | undefined;
}
export const PlanSearchDataInitialState: PlanSearchData = {
    open: {},
    selectedMajor: null,
    selectedTerm: Object.keys(TermIdByName)[0],
    selectedMinor: null,
    selectedSubplan: null,
    searchMajor: null,
    searchSubplan: null,
    searchMinor: null,
    openCourses: {},
    isLoaded: true,
    progress: 0,
    progressLabel: '',
    hideNoSections: false
}

export type GEPData = {
    selectedTerm: string | null;
    searchSubject: string | null;
    isLoaded: boolean;
    progress: number;
    progressLabel: string | null;
    courseData: Record<string, MergedCourseData> | {};
    courses: RequiredCourse[];
    hideNoSections: boolean;

}
export const GEPDataInitialState: GEPData = {
    selectedTerm: Object.keys(TermIdByName)[0],
    searchSubject: '',
    isLoaded: true,
    progress: 0,
    progressLabel: '',
    courseData: {},
    courses: [],
    hideNoSections: false
}
