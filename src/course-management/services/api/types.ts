import type {
  GradeData,
  MatchedRateMyProf
} from "../../../degree-planning/types/DataBaseResponses/SupaBaseResponseType.ts";


/**
 * Combined course grade data and RateMyProfessor info returned by backend for a single query.
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
 * Data shape returned by batch API that may include lists of grade data and professors.
 */
export interface BatchDataRequestResponse {
  courses?: GradeData[];
  profs?: MatchedRateMyProf[];
}

/**
 * Rendered DOM elements for course grade and professor cards.
 */
export interface CourseElements {
  gradeElement: HTMLDivElement;
  professorElement: HTMLDivElement;
} 