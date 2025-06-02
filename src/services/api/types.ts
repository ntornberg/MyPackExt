import type { GradeData, MatchedRateMyProf } from '../../types/SupaBaseResponseType';

/**
 * Interface for a single course data response from the API
 */
export interface SingleCourseDataResponse {
  CourseData: {
    unique_hash: string | null;
    subject: string | null;
    course_name: string | null;
    instructor_name: string | null;
    a_average: string | null;
    b_average: string | null;
    c_average: string | null;
    d_average: string | null;
    f_average: string | null;
    class_avg_max: string | null;
    class_avg_min: string | null;
  };
  RateMyProfInfo: {
    master_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avgRating: number | null;
    department: string | null;
    school: string | null;
    id: string | null;
  };
}

/**
 * Interface for batch data request response
 */
export interface BatchDataRequestResponse {
  courses?: GradeData[];
  profs?: MatchedRateMyProf[];
}

/**
 * Interface for course elements (grade and professor cards)
 */
export interface CourseElements {
  gradeElement: HTMLDivElement;
  professorElement: HTMLDivElement;
} 