/** ─────────── Core look-up / “option” objects ─────────── */

export interface Course {
    text:  string;
    value: string;
  }
  
  export interface InstructorOption {
    id:       number;   // C# int → number
    unity_id: string;
    name:     string;
  }
  
  export interface SemesterOption {
    value: string;
    text:  string;
  }
  
  /** ─────────── Aggregated “Options” holder ─────────── */
  
  export interface Options {
    instructors: InstructorOption[];   // List<T> → T[]
    sems:        SemesterOption[];
    years:       string[];
  }
  
  /** ─────────── Grade + Google-chart support types ─────────── */
  
  export interface GradeDetail {
    raw:        number;
    percentage: string;
  }
  
  // Google-Chart cell / row / column definitions
  export interface ChartCell   { v: unknown; }           // C# object → unknown
  export interface ChartRow    { c: ChartCell[]; }
  export interface ChartColumn {
    id:    string;
    label: string;
    type:  string;
  }
  
  export interface GoogleChart {
    cols: ChartColumn[];
    rows: ChartRow[];
  }
  
  /** ─────────── Data for one course record ─────────── */
  
  export interface IndividualCourse {
    courseName:      string;
    courseId:        string;
    instructorName:  string;
    courseSem:       string;
    grades:          Record<string, GradeDetail>; // Dictionary → Record<key, value>
    googleChart:     GoogleChart;
  }
  
  /** ─────────── Combined (“composite”) view ─────────── */
  
  export interface Composite {
    googleChartPie: GoogleChart;
    googleChartBar: GoogleChart;
    grades:         Record<string, GradeDetail>;
    pieTitle:       string;
    pieInfo:        string;
  }
  
  /** ─────────── Root of entire JSON payload ─────────── */
  
  export interface RootObject {
    individual: IndividualCourse[];
    composite:  Composite;
  }
  