// Keeps track of search info when switching dialog tabs.
import type { MergedCourseData } from "../../types/Section";
import type { RequiredCourse } from "../../../degree-planning/types/Plans.ts";
import { TermIdByName } from "../../../degree-planning/DialogAutoCompleteKeys/TermID.ts";

export type TabUpdater<T> = (
  keyOrPatch: keyof T | Partial<T>,
  value?: unknown,
) => void;

export const DEFAULT_TERM_NAME = "2026 Fall Term";

const termOptions = Object.keys(TermIdByName);
const DEFAULT_TERM = termOptions.includes(DEFAULT_TERM_NAME)
  ? DEFAULT_TERM_NAME
  : (termOptions[0] ?? "");

export type CourseSearchData = {
  selectedTerm: string | null;
  searchSubject: string | null;
  searchCourse: string | null;
  selectedCourseInfo: {
    code: string | null;
    catalogNum: string | null;
    title: string | null;
    id: string;
  };
};
export const CourseSearchDataInitialState: CourseSearchData = {
  selectedTerm: DEFAULT_TERM,
  searchSubject: null,
  searchCourse: null,
  selectedCourseInfo: { code: null, catalogNum: null, title: null, id: "" },
};
export type PlanSearchData = {
  open: Record<string, boolean>;
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
};
export const PlanSearchDataInitialState: PlanSearchData = {
  open: {},
  selectedMajor: null,
  selectedTerm: DEFAULT_TERM,
  selectedMinor: null,
  selectedSubplan: null,
  searchMajor: null,
  searchSubplan: null,
  searchMinor: null,
  openCourses: {},
  isLoaded: true,
  progress: 0,
  progressLabel: "",
  hideNoSections: true,
};

export type GEPData = {
  selectedTerm: string | null;
  searchSubject: string | null;
  isLoaded: boolean;
  progress: number;
  progressLabel: string | null;
  courseData: Record<string, MergedCourseData> | {};
  courses: RequiredCourse[];
  hideNoSections: boolean;
};
export const GEPDataInitialState: GEPData = {
  selectedTerm: DEFAULT_TERM,
  searchSubject: "",
  isLoaded: true,
  progress: 0,
  progressLabel: "",
  courseData: {},
  courses: [],
  hideNoSections: true,
};
