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

export function gradeDistributionAverageGradePoint(
  g: GradeData | undefined,
): number | null {
  const total = gradeDistributionTotal(g);
  if (!g || total <= 0) {
    return null;
  }
  return (
    (g.a_average * 4 +
      g.b_average * 3 +
      g.c_average * 2 +
      g.d_average * 1 +
      g.f_average * 0) /
    total
  );
}

export function gradePointToPercent(gradePoint: number): number {
  if (!Number.isFinite(gradePoint)) {
    return 0;
  }
  return Math.max(0, Math.min(100, (gradePoint / 4) * 100));
}

export function formatGradePointAsPercent(
  gradePoint: number,
  fractionDigits = 0,
): string {
  return `${gradePointToPercent(gradePoint).toFixed(fractionDigits)}%`;
}

const LETTER_GRADE_POINT_SCALE = [
  { letter: "A+", points: 4.333 },
  { letter: "A", points: 4 },
  { letter: "A-", points: 3.667 },
  { letter: "B+", points: 3.333 },
  { letter: "B", points: 3 },
  { letter: "B-", points: 2.667 },
  { letter: "C+", points: 2.333 },
  { letter: "C", points: 2 },
  { letter: "C-", points: 1.667 },
  { letter: "D+", points: 1.333 },
  { letter: "D", points: 1 },
  { letter: "D-", points: 0.667 },
  { letter: "F", points: 0 },
] as const;

export function formatGradePointAsLetter(gradePoint: number): string {
  if (!Number.isFinite(gradePoint)) {
    return "Unavailable";
  }

  for (let i = 0; i < LETTER_GRADE_POINT_SCALE.length - 1; i += 1) {
    const current = LETTER_GRADE_POINT_SCALE[i]!;
    const next = LETTER_GRADE_POINT_SCALE[i + 1]!;
    const threshold = (current.points + next.points) / 2;

    if (gradePoint >= threshold) {
      return current.letter;
    }
  }

  return "F";
}

/** 0-100 grade percentage → chip fill. */
export function gradePercentChipColor(percent: number): string {
  if (percent >= gradePointToPercent(3.55)) {
    return "hsl(152, 58%, 32%)";
  }
  if (percent >= gradePointToPercent(3.15)) {
    return "hsl(128, 52%, 34%)";
  }
  if (percent >= gradePointToPercent(2.75)) {
    return "hsl(88, 48%, 36%)";
  }
  if (percent >= gradePointToPercent(2.35)) {
    return "hsl(48, 86%, 38%)";
  }
  if (percent >= gradePointToPercent(2.0)) {
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
