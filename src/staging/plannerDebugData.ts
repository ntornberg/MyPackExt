import type { GradeData, MatchedRateMyProf } from "../types/api";
import {
  type ScheduleEvent,
  CALENDAR_COLOR_CART_CLASS,
  CALENDAR_COLOR_CONFLICT_SWATCH,
  CALENDAR_COLOR_ENROLLED_CLASS,
  CALENDAR_COLOR_PINNED_SECTION,
} from "../course-management/types/Calendar";
import type { SectionLinkedMeeting } from "../course-management/types/Section";

export type StagingTabId = "course_search" | "gep_search" | "plan_search";

export type StagingResult = {
  id: string;
  courseCode: string;
  title: string;
  section: string;
  classNumber: string;
  instructor: string;
  meeting: string;
  location: string;
  status: string;
  seats: string;
  component: string;
  rating: number;
  tags: string[];
  notes?: string;
  requisites?: string;
  schedule: ScheduleEvent[];
  /** Same enrollment: lab / recitation paired with the primary row (mirrors grouped course search). */
  linkedMeetings?: SectionLinkedMeeting[];
  professor_rating?: MatchedRateMyProf;
  grade_distribution?: GradeData;
};

function mockGrade(
  courseName: string,
  subject: string,
  instructor: string,
  mix: [number, number, number, number, number],
  gpaMin = 2.75,
  gpaMax = 3.45,
): GradeData {
  const [a_average, b_average, c_average, d_average, f_average] = mix;
  return {
    course_name: courseName,
    subject,
    instructor_name: instructor,
    a_average,
    b_average,
    c_average,
    d_average,
    f_average,
    class_avg_min: gpaMin,
    class_avg_max: gpaMax,
  };
}

function mockRmp(
  name: string,
  avg: number | null,
  department: string,
): MatchedRateMyProf {
  return {
    master_name: name,
    first_name: null,
    last_name: null,
    avgRating: avg,
    department,
    school: "North Carolina State University",
    id: null,
  };
}

export type StagingTabData = {
  id: StagingTabId;
  label: string;
  eyebrow: string;
  description: string;
  filters: {
    term: string[];
    primary: string[];
    secondary: string[];
    tertiary?: string[];
  };
  results: StagingResult[];
};

const courseResults: StagingResult[] = [
  {
    id: "csc-316-001",
    courseCode: "CSC 316",
    title: "Data Structures and Algorithms",
    section: "001",
    classNumber: "10231",
    instructor: "King, Jason Tyler",
    meeting: "MW 12:00 PM - 1:15 PM",
    location: "Hunt 100",
    status: "Open",
    seats: "60/130",
    component: "Lecture",
    rating: 4.6,
    tags: ["Core", "Popular", "Afternoon"],
    notes: "Strong fit for the compare-card layout because it has clear lecture details and a stable compare workflow.",
    requisites: "CSC 216 or equivalent programming experience.",
    professor_rating: mockRmp("Jason Tyler King", 4.6, "Computer Science"),
    grade_distribution: mockGrade(
      "CSC 316 — Data Structures and Algorithms",
      "CSC",
      "King, Jason Tyler",
      [36, 32, 14, 4, 2],
    ),
    schedule: [
      {
        id: 1,
        subj: "CSC 316 Lecture",
        start: "12:00 PM",
        end: "1:15 PM",
        days: [
          { day: "Mon", isOverlapping: false },
          { day: "Wed", isOverlapping: false },
        ],
        color: CALENDAR_COLOR_PINNED_SECTION,
      },
    ],
  },
  {
    id: "py-208-001",
    courseCode: "PY 208",
    title: "Physics for Engineers and Scientists I",
    section: "001",
    classNumber: "18452",
    instructor: "Beichner, Robert",
    meeting: "MW 9:00 AM - 10:15 AM",
    location: "Riddick Hall 301",
    status: "Open",
    seats: "120/200",
    component: "Lecture",
    rating: 3.8,
    tags: ["Lecture + lab"],
    notes:
      "Lecture with two lab time options: pick a lab before Add to cart in staging; course search uses Add + lab menu.",
    requisites: "MAT 121 or equivalent.",
    professor_rating: mockRmp("Robert Beichner", 3.8, "Physics"),
    grade_distribution: mockGrade(
      "PY 208 — Physics for Engineers and Scientists I",
      "PY",
      "Beichner, Robert",
      [22, 34, 28, 10, 6],
      2.65,
      3.15,
    ),
    linkedMeetings: [
      {
        section: "001",
        classNumber: "18453",
        component: "Laboratory",
        dayTime: "F 12:30 PM - 2:20 PM",
        location: "Partners I 3118",
      },
      {
        section: "002",
        classNumber: "18454",
        component: "Laboratory",
        dayTime: "Th 3:00 PM - 4:50 PM",
        location: "Riddick 202A",
      },
    ],
    schedule: [
      {
        id: 11,
        subj: "PY 208 Lecture",
        start: "9:00 AM",
        end: "10:15 AM",
        days: [
          { day: "Mon", isOverlapping: false },
          { day: "Wed", isOverlapping: false },
        ],
        color: CALENDAR_COLOR_PINNED_SECTION,
      },
      {
        id: 12,
        subj: "PY 208 Laboratory",
        start: "12:30 PM",
        end: "2:20 PM",
        days: [{ day: "Fri", isOverlapping: false }],
        color: CALENDAR_COLOR_PINNED_SECTION,
      },
      {
        id: 13,
        subj: "PY 208 Laboratory (alt)",
        start: "3:00 PM",
        end: "4:50 PM",
        days: [{ day: "Thu", isOverlapping: false }],
        color: CALENDAR_COLOR_PINNED_SECTION,
      },
    ],
  },
  {
    id: "csc-316-002",
    courseCode: "CSC 316",
    title: "Data Structures and Algorithms",
    section: "002",
    classNumber: "10232",
    instructor: "King, Jason Tyler",
    meeting: "MW 3:00 PM - 4:15 PM",
    location: "EB2 1220",
    status: "Open",
    seats: "46/110",
    component: "Lecture",
    rating: 4.4,
    tags: ["Core", "Compare", "Late afternoon"],
    notes: "Useful for exploring denser comparison cards and alternate spacing decisions.",
    requisites: "CSC 216 or equivalent programming experience.",
    professor_rating: mockRmp("Jason Tyler King", 4.4, "Computer Science"),
    grade_distribution: mockGrade(
      "CSC 316 — Data Structures and Algorithms",
      "CSC",
      "King, Jason Tyler",
      [32, 34, 18, 5, 3],
    ),
    schedule: [
      {
        id: 2,
        subj: "CSC 316 Lecture",
        start: "3:00 PM",
        end: "4:15 PM",
        days: [
          { day: "Mon", isOverlapping: false },
          { day: "Wed", isOverlapping: false },
        ],
        color: CALENDAR_COLOR_PINNED_SECTION,
      },
    ],
  },
  {
    id: "csc-316-201",
    courseCode: "CSC 316",
    title: "Data Structures and Algorithms",
    section: "201",
    classNumber: "11098",
    instructor: "Staff",
    meeting: "TuTh 1:30 PM - 2:45 PM",
    location: "Withers 232",
    status: "Waitlist",
    seats: "0/90",
    component: "Lecture",
    rating: 4.1,
    tags: ["Waitlist", "Alt slot"],
    notes: "Keeps a less ideal result in the dataset so empty/negative states are easy to inspect.",
    requisites: "CSC 216 or equivalent programming experience.",
    professor_rating: mockRmp("Staff", null, "Computer Science"),
    grade_distribution: mockGrade(
      "CSC 316 — Data Structures and Algorithms",
      "CSC",
      "Multiple instructors",
      [28, 30, 22, 8, 6],
      2.55,
      3.2,
    ),
    schedule: [
      {
        id: 3,
        subj: "CSC 316 Lecture",
        start: "1:30 PM",
        end: "2:45 PM",
        days: [
          { day: "Tue", isOverlapping: true },
          { day: "Thu", isOverlapping: true },
        ],
        color: CALENDAR_COLOR_CONFLICT_SWATCH,
      },
    ],
  },
];

const gepResults: StagingResult[] = [
  {
    id: "eng-331-001",
    courseCode: "ENG 331",
    title: "Communication for Engineering and Technology",
    section: "001",
    classNumber: "20311",
    instructor: "Meyers, Alicia",
    meeting: "TuTh 10:15 AM - 11:30 AM",
    location: "Tompkins 201",
    status: "Open",
    seats: "18/40",
    component: "Lecture",
    rating: 4.3,
    tags: ["GEP", "Communication", "Speaking", "Writing"],
    professor_rating: mockRmp("Alicia Meyers", 4.2, "English"),
    grade_distribution: mockGrade(
      "ENG 331 — Communication for Engineering and Technology",
      "ENG",
      "Meyers, Alicia",
      [22, 38, 24, 10, 6],
      2.85,
      3.35,
    ),
    schedule: [
      {
        id: 4,
        subj: "ENG 331",
        start: "10:15 AM",
        end: "11:30 AM",
        days: [
          { day: "Tue", isOverlapping: false },
          { day: "Thu", isOverlapping: false },
        ],
        color: CALENDAR_COLOR_PINNED_SECTION,
      },
    ],
  },
  {
    id: "soc-202-001",
    courseCode: "SOC 202",
    title: "Principles of Sociology",
    section: "001",
    classNumber: "18762",
    instructor: "Byrne, Taylor",
    meeting: "MWF 11:45 AM - 12:35 PM",
    location: "Caldwell 120",
    status: "Open",
    seats: "12/35",
    component: "Lecture",
    rating: 4.0,
    tags: [
      "GEP",
      "Humanities",
      "Sociology",
      "Social",
      "Arts",
      "Visual",
      "Diversity",
    ],
    professor_rating: mockRmp("Taylor Byrne", 3.9, "Sociology"),
    grade_distribution: mockGrade(
      "SOC 202 — Principles of Sociology",
      "SOC",
      "Byrne, Taylor",
      [18, 28, 32, 14, 8],
      2.65,
      3.15,
    ),
    schedule: [
      {
        id: 5,
        subj: "SOC 202",
        start: "11:45 AM",
        end: "12:35 PM",
        days: [
          { day: "Mon", isOverlapping: false },
          { day: "Wed", isOverlapping: false },
          { day: "Fri", isOverlapping: false },
        ],
        color: CALENDAR_COLOR_PINNED_SECTION,
      },
    ],
  },
];

const planResults: StagingResult[] = [
  {
    id: "ece-309-001",
    courseCode: "ECE 309",
    title: "Analytical Foundations of Electrical Engineering",
    section: "001",
    classNumber: "31042",
    instructor: "Grayson, Matt",
    meeting: "MW 9:10 AM - 10:25 AM",
    location: "Engineering 3 214",
    status: "Open",
    seats: "22/60",
    component: "Lecture",
    rating: 4.2,
    tags: ["Major core", "Math-heavy"],
    professor_rating: mockRmp("Matt Grayson", 4.1, "Electrical & Computer Engineering"),
    grade_distribution: mockGrade(
      "ECE 309 — Analytical Foundations of EE",
      "ECE",
      "Grayson, Matt",
      [24, 34, 26, 10, 6],
      2.78,
      3.4,
    ),
    schedule: [
      {
        id: 6,
        subj: "ECE 309",
        start: "9:10 AM",
        end: "10:25 AM",
        days: [
          { day: "Mon", isOverlapping: false },
          { day: "Wed", isOverlapping: false },
        ],
        color: CALENDAR_COLOR_PINNED_SECTION,
      },
    ],
  },
  {
    id: "ece-302-201",
    courseCode: "ECE 302",
    title: "Linear Systems",
    section: "201",
    classNumber: "31011",
    instructor: "Davis, Priya",
    meeting: "TuTh 3:00 PM - 4:15 PM",
    location: "Engineering 2 321",
    status: "Open",
    seats: "8/45",
    component: "Lecture",
    rating: 4.5,
    tags: ["Major core", "Signals"],
    professor_rating: mockRmp("Priya Davis", 4.7, "Electrical & Computer Engineering"),
    grade_distribution: mockGrade(
      "ECE 302 — Linear Systems",
      "ECE",
      "Davis, Priya",
      [40, 30, 16, 6, 2],
      2.9,
      3.55,
    ),
    schedule: [
      {
        id: 7,
        subj: "ECE 302",
        start: "3:00 PM",
        end: "4:15 PM",
        days: [
          { day: "Tue", isOverlapping: false },
          { day: "Thu", isOverlapping: false },
        ],
        color: CALENDAR_COLOR_PINNED_SECTION,
      },
    ],
  },
];

export const plannerStagingTabs: StagingTabData[] = [
  {
    id: "course_search",
    label: "Course Search",
    eyebrow: "Course Search",
    description: "Sample sections for card-based comparison.",
    filters: {
      term: ["2026 Fall Term", "2027 Spring Term", "2027 Summer I"],
      primary: ["CSC - Computer Science", "ECE - Electrical Engineering", "MA - Mathematics"],
      secondary: [
        "CSC 316 Data Structures and Algorithms",
        "PY 208 Physics for Engineers and Scientists I",
        "CSC 326 Software Engineering",
        "CSC 401 Operating Systems",
      ],
    },
    results: courseResults,
  },
  {
    id: "gep_search",
    label: "GEP Search",
    eyebrow: "GEP Search",
    description: "Mock grouped requirement results for wider layout experiments.",
    filters: {
      term: ["2026 Fall Term", "2027 Spring Term"],
      primary: ["Communication", "Humanities", "Social Sciences"],
      secondary: ["Speaking and Writing", "Visual and Performing Arts", "U.S. Diversity"],
    },
    results: gepResults,
  },
  {
    id: "plan_search",
    label: "Major Search",
    eyebrow: "Major Search",
    description: "Major and minor planning results for tree and rail iteration.",
    filters: {
      term: ["2026 Fall Term", "2027 Spring Term"],
      primary: ["Electrical Engineering", "Computer Science", "Mechanical Engineering"],
      secondary: ["Computer Engineering", "Minor in Mathematics", "Minor in Statistics"],
      tertiary: ["Systems", "Power", "Communications"],
    },
    results: planResults,
  },
];

export const plannerStagingSnapshot = {
  enrolledCourses: 5,
  cartCourses: 1,
  weeklyMeetings: 4,
  plannedCourses: 6,
};

/** Mock cart meetings (blue) — distinct from enrolled slate and preview green. */
export const plannerCartSchedule: ScheduleEvent[] = [
  {
    id: 9_000,
    subj: "PY 208 Lab (cart)",
    start: "9:00 AM",
    end: "10:45 AM",
    days: [{ day: "Fri", isOverlapping: false }],
    color: CALENDAR_COLOR_CART_CLASS,
  },
];

export const plannerBaseSchedule: ScheduleEvent[] = [
  {
    id: 100,
    subj: "CSC 216 Lecture",
    start: "10:15 AM",
    end: "11:30 AM",
    days: [
      { day: "Mon", isOverlapping: false },
      { day: "Wed", isOverlapping: false },
    ],
    color: CALENDAR_COLOR_ENROLLED_CLASS,
  },
  {
    id: 101,
    subj: "MA 305",
    start: "1:30 PM",
    end: "2:45 PM",
    days: [
      { day: "Tue", isOverlapping: false },
      { day: "Thu", isOverlapping: false },
    ],
    color: CALENDAR_COLOR_ENROLLED_CLASS,
  },
  {
    id: 102,
    subj: "ECE 306",
    start: "3:00 PM",
    end: "4:15 PM",
    days: [
      { day: "Mon", isOverlapping: false },
      { day: "Wed", isOverlapping: false },
    ],
    color: CALENDAR_COLOR_ENROLLED_CLASS,
  },
];

/** Cart + enrolled mock blocks used for “fits my schedule” filtering. */
export const plannerCalendarBackgroundForFit: ScheduleEvent[] = [
  ...plannerCartSchedule,
  ...plannerBaseSchedule,
];
