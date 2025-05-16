export type Course = {
  course_id: string;
  course_abr: string;
  course_descrip: string;
};

export type Requirement = {
  id: string;
  min_units: number;
  courses: Course[];
};

export type Subplan = {
  id: string;
  requirements: Record<string, Requirement>;
};

export type MajorPlan = {
  id: string;
  subplans: Record<string, Subplan>;
};

export type MajorPlans = Record<string, MajorPlan>;

export type MinorPlan = {
  id: string;
  requirements: Record<string, Requirement>;
};

export type MinorPlans = Record<string, MinorPlan>; 