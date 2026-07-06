import type { GradeData, MatchedRateMyProf } from "../../types/api.ts";
import type {
  CourseData,
  CourseSection,
} from "../../utils/course-search/parseRegistrarUtil";

/** Additional meeting rows for the same enrollment (e.g. lab with lecture). */
export type SectionLinkedMeeting = {
  dayTime: string;
  location: string;
  component: string;
  classNumber?: string;
  section?: string;
};

export type ModifiedSection = CourseSection & {
  grade_distribution?: GradeData;
  professor_rating?: MatchedRateMyProf;
  // Cart functionality fields
  course_id?: string;
  catalog_nbr?: string;
  course_career?: string;
  session_code?: string;
  grading_basis?: string;
  rqmnt_designtn?: string;
  wait_list_okay?: string;
  courseData?: CourseData; // Reference to parent course for easy access
  /** Parsed from grouped sections: lab/recitation meetings paired with this row. */
  linkedMeetings?: SectionLinkedMeeting[];
};

export type GroupedSections = {
  lecture: ModifiedSection | null;
  labs: ModifiedSection[] | null;
};

export type MergedCourseData = Omit<CourseData, "sections"> & {
  sections: Record<string, GroupedSections>;
  course_id?: string; // Store course_id at course level
};
