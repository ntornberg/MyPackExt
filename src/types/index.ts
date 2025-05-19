// --- Course Data Structure ---
export type Course = {
    title: string;
    id: string;
    abr: string;
    instructor: string;
}

export type MatchedRateMyProf = {
    master_name: string;
    first_name?: string | null;
    last_name?: string | null;
    avgRating?: number | null;
    department?: string | null;
    school?: string | null;
    id?: string | null;
};

export type GradeData = {
    course_name: string;
    subject: string;
    instructor_name: string;
    a_average: number;
    b_average: number;
    c_average: number;
    d_average: number;
    f_average: number;
    class_avg_min: number;
    class_avg_max: number;
};

declare global {
    interface Window {
        __savedDefine?: any;
    }
}
