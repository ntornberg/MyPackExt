export type RequiredCourse = {
  readonly course_id: string;
  readonly course_abr: string;
  readonly course_descrip: string;
  readonly catalog_num: string;
};

export type Requirement = {
  readonly id: string;
  readonly min_units: number;
  readonly courses: readonly RequiredCourse[];
};

export type Subplan = {
  readonly id: string;
  readonly requirements: Record<string, Requirement>;
};

export type MajorPlan = {
  readonly id: string;
  readonly subplans: Record<string, Subplan>;
};

export type MajorPlans = Record<string, MajorPlan>;

export type MinorPlan = {
  readonly id: string;
  readonly requirements: Record<string, Requirement>;
};

export type MinorPlans = Record<string, MinorPlan>;
