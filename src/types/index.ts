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
    courseName: string;
    subject: string;
    instructorName: string;
    aAverage: number;
    bAverage: number;
    cAverage: number;
    dAverage: number;
    fAverage: number;
    classAverageMin: number;
    classAverageMax: number;
};

declare global {
    interface Window {
        __savedDefine?: any;
    }
}
