import { AppLogger } from "../logger";

import type {
  GroupedSections,
  ModifiedSection,
} from "../../course-management/types/Section";
import type { CourseSection } from "./parseRegistrarUtil";

/** Registrar / PeopleSoft vary casing and wording ("Lec", "LEC", "Lecture"). */
function isLectureComponent(component: string): boolean {
  const c = component.trim().toLowerCase();
  return c === "lec" || c === "lecture";
}

/** Strip BOM / ZWSP / NBSP that sometimes appear in scraped registrar cells. */
function scrubSectionToken(raw: string): string {
  return raw.replace(/[\u200B-\u200D\uFEFF\u00a0]/g, "").trim();
}

/**
 * PeopleSoft enrollment section: lecture `001`, recitations `001A`/`001I` share the
 * same **numeric** enrollment block. We key by that number so `001`, `01`, and `1`
 * never split one lecture from its rec/lab rows. Prefer the section column over
 * `id` so class numbers never perturb the bucket (e.g. id `10-101` must not key as `101`).
 */
function enrollmentSectionGroupKey(
  sectionLabel: string,
  rowId: string,
): string | null {
  const label = scrubSectionToken(sectionLabel);
  const fromLabel = label.match(/^(\d+)/u);
  let digitRun = fromLabel?.[1] ?? null;
  if (!digitRun) {
    const idHead = scrubSectionToken(rowId.split("-")[0] ?? "");
    digitRun = idHead.match(/^(\d+)/u)?.[1] ?? null;
  }
  if (digitRun) {
    const n = parseInt(digitRun, 10);
    if (Number.isFinite(n) && n >= 0) {
      return String(n);
    }
    return digitRun;
  }
  const fallback = scrubSectionToken(rowId).match(/\d+/u);
  return fallback?.[0] ?? null;
}

/**
 * Groups registrar sections by numeric section id into a lecture with associated labs.
 * Optionally maps through a provided section override map (e.g., enriched sections).
 *
 * @param {CourseSection[]} sections Flat list of sections for a course
 * @param {Record<string, ModifiedSection>} [courseSections] Optional override map by section id
 * @returns {Record<string, GroupedSections>} Grouped lecture and labs keyed by numeric id
 */
export function groupSections(
  sections: CourseSection[],
  courseSections?: Record<string, ModifiedSection>,
) {
  const groupedSections: Record<string, GroupedSections> = {};
  for (const section of sections) {
    const groupKey = enrollmentSectionGroupKey(section.section, section.id);
    if (groupKey) {
      if (!groupedSections[groupKey]) {
        groupedSections[groupKey] = { lecture: null, labs: [] };
      }
      if (isLectureComponent(section.component)) {
        if (groupedSections[groupKey].lecture != null) {
          AppLogger.warn("Lecture already exists for", groupKey);
        }
        const resolved = courseSections
          ? courseSections[section.id]
          : section;
        if (resolved) {
          groupedSections[groupKey].lecture = resolved;
        }
      } else {
        const resolved = courseSections
          ? courseSections[section.id]
          : section;
        if (resolved) {
          groupedSections[groupKey].labs?.push(resolved);
        }
      }
    }
  }
  return groupedSections;
}
