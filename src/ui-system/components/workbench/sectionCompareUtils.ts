import type {
  GroupedSections,
  ModifiedSection,
  SectionLinkedMeeting,
} from "../../../course-management/types/Section";
import type { GradeData } from "../../../types/api";

import { getPreviewSectionId } from "./workbenchTypes";

export function formatSectionInstructors(section: ModifiedSection): string {
  const n = section.instructor_name;
  if (Array.isArray(n)) {
    return n.filter(Boolean).join(", ");
  }
  return typeof n === "string" ? n : "";
}

function linkedMeetingFromLab(lab: ModifiedSection): SectionLinkedMeeting {
  return {
    dayTime: lab.dayTime,
    location: lab.location,
    component: lab.component,
    classNumber: lab.classNumber,
    section: lab.section,
  };
}

/**
 * Lecture + optional lab pick for preview/calendar (single linked meeting when multiple labs exist).
 */
export function groupedSectionForPreview(
  group: GroupedSections,
  selectedLabClassNumber?: string | null,
): ModifiedSection | null {
  const lecture = group.lecture;
  if (!lecture) {
    return null;
  }
  const labs = (group.labs ?? []).filter(Boolean) as ModifiedSection[];
  if (labs.length === 0) {
    return lecture;
  }
  if (labs.length === 1) {
    if (lecture.linkedMeetings && lecture.linkedMeetings.length > 0) {
      return lecture;
    }
    return {
      ...lecture,
      linkedMeetings: [linkedMeetingFromLab(labs[0]!)],
    };
  }
  const pick =
    selectedLabClassNumber != null && selectedLabClassNumber !== ""
      ? labs.find(
          (l) => String(l.classNumber) === String(selectedLabClassNumber),
        )
      : undefined;
  const chosen = pick ?? labs[0]!;
  return {
    ...lecture,
    linkedMeetings: [linkedMeetingFromLab(chosen)],
  };
}

export function defaultLabClassForGroup(
  group: GroupedSections,
): string | undefined {
  const labs = (group.labs ?? []).filter(Boolean) as ModifiedSection[];
  if (labs.length <= 1) {
    return undefined;
  }
  return String(labs[0]!.classNumber);
}

export function sectionMatchesInstructorFilter(
  section: ModifiedSection,
  instructorFilter: string | null,
): boolean {
  if (!instructorFilter) {
    return true;
  }
  return formatSectionInstructors(section).trim() === instructorFilter.trim();
}

export function gradeDistributionTotal(g: GradeData | undefined): number {
  if (!g) {
    return 0;
  }
  return g.a_average + g.b_average + g.c_average + g.d_average + g.f_average;
}

/** Midpoint of typical class GPA band → chip fill. */
export function gpaBandChipColor(mid: number): string {
  if (mid >= 3.55) {
    return "hsl(152, 58%, 32%)";
  }
  if (mid >= 3.15) {
    return "hsl(128, 52%, 34%)";
  }
  if (mid >= 2.75) {
    return "hsl(88, 48%, 36%)";
  }
  if (mid >= 2.35) {
    return "hsl(48, 86%, 38%)";
  }
  if (mid >= 2.0) {
    return "hsl(28, 88%, 42%)";
  }
  return "hsl(0, 62%, 40%)";
}

export function dominantGradeLetter(g: GradeData): {
  letter: string;
  pctOfMix: number;
  total: number;
} {
  const pairs: [string, number][] = [
    ["A", g.a_average],
    ["B", g.b_average],
    ["C", g.c_average],
    ["D", g.d_average],
    ["F", g.f_average],
  ];
  let best = pairs[0]!;
  for (const p of pairs) {
    if (p[1] > best[1]) {
      best = p;
    }
  }
  const total = pairs.reduce((s, [, v]) => s + v, 0);
  return {
    letter: best[0]!,
    pctOfMix: total > 0 ? (best[1]! / total) * 100 : 0,
    total,
  };
}

export function previewIdForGroupedRow(
  group: GroupedSections,
  selectedLabClassNumber?: string | null,
): string | null {
  const s = groupedSectionForPreview(group, selectedLabClassNumber);
  return s ? getPreviewSectionId(s) : null;
}
