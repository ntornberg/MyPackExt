import type {
  ModifiedSection,
  SectionLinkedMeeting,
} from "../course-management/types/Section";

import type { StagingResult } from "./plannerDebugData";

export type StagingPreviewOptions = {
  /**
   * When the row has multiple labs, pass the chosen class number so the calendar
   * and preview only pin lecture + that lab. Omit or pass only one lab’s number.
   */
  selectedLabClassNumber?: string;
};

function resolveLinkedMeetings(
  result: StagingResult,
  options?: StagingPreviewOptions,
): SectionLinkedMeeting[] | undefined {
  const raw = result.linkedMeetings;
  if (!raw?.length) {
    return undefined;
  }
  if (raw.length === 1) {
    return raw;
  }
  const pick =
    options?.selectedLabClassNumber != null &&
    options.selectedLabClassNumber !== ""
      ? raw.find(
          (m) =>
            String(m.classNumber) === String(options.selectedLabClassNumber),
        )
      : raw[0];
  return pick ? [pick] : [raw[0]!];
}

/**
 * Builds a `ModifiedSection`-shaped object from staging mock data so the real
 * `PlannerPreviewRail` and `createSectionPreview` can render without MyPack HTML.
 */
/**
 * Lecture row for list UI: keeps every linked meeting so multi-lab pickers can render.
 * Use {@link stagingResultToModifiedSection} with `selectedLabClassNumber` for preview/cart.
 */
export function stagingResultToRowDisplaySection(
  result: StagingResult,
): ModifiedSection {
  const base = stagingResultToModifiedSection(result, {});
  const full = result.linkedMeetings?.length
    ? result.linkedMeetings
    : base.linkedMeetings;
  return {
    ...base,
    ...(full?.length ? { linkedMeetings: full } : {}),
  };
}

export function stagingResultToModifiedSection(
  result: StagingResult,
  options?: StagingPreviewOptions,
): ModifiedSection {
  const deptMatch = result.courseCode.match(/^([A-Za-z]+)\s*(\d+[A-Za-z]?)/);
  const catalog =
    deptMatch?.[2] ?? result.courseCode.replace(/^[A-Za-z]+\s*/i, "");

  const linkedMeetings = resolveLinkedMeetings(result, options);

  return {
    id: result.id,
    section: result.section,
    component: result.component,
    classNumber: result.classNumber,
    availability: result.status,
    enrollment: result.seats,
    dayTime: result.meeting,
    location: result.location,
    ...(linkedMeetings?.length ? { linkedMeetings } : {}),
    instructor_name: [result.instructor],
    dates: "",
    notes: result.notes ?? null,
    requisites: result.requisites ?? null,
    courseData: {
      code: result.courseCode,
      title: result.title,
      units: "—",
      description: "",
      prerequisite: null,
      sections: [],
    },
    course_id: `staging-${result.id}`,
    catalog_nbr: catalog,
    ...(result.professor_rating
      ? { professor_rating: result.professor_rating }
      : {}),
    ...(result.grade_distribution
      ? { grade_distribution: result.grade_distribution }
      : {}),
  };
}
