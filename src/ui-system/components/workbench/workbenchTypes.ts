import type { ModifiedSection } from "../../../course-management/types/Section";

export type PlannerWorkbenchTab = "course_search" | "gep_search" | "plan_search";

export type PlannerSectionPreview = {
  id: string;
  tab: PlannerWorkbenchTab;
  section: ModifiedSection;
  courseCode: string;
  courseTitle: string;
};

export const getPreviewSectionId = (section: ModifiedSection): string =>
  [
    section.classNumber,
    section.section,
    section.component,
    section.dayTime,
    section.location,
  ]
    .filter(Boolean)
    .join("::");

export const createSectionPreview = (
  tab: PlannerWorkbenchTab,
  section: ModifiedSection,
): PlannerSectionPreview => ({
  id: getPreviewSectionId(section),
  tab,
  section,
  courseCode: section.courseData?.code ?? section.course_id ?? "Course",
  courseTitle: section.courseData?.title ?? "Section details",
});
