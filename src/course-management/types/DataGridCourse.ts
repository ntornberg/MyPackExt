import type { GroupedSections } from "../../core/utils/CourseSearch/MergeDataUtil";

/**
 * Sort comparator for grouped sections by availability and then professor rating.
 *
 * Order: Open > Reserved > Waitlist > Closed
 */
export function sortSections(v1: GroupedSections, v2: GroupedSections) {
  const availabilityOrder: Record<string, number> = {
    Open: 3,
    Reserved: 2,
    Waitlist: 1,
    Closed: 0,
  };

  const lecture1 = v1.lecture;
  const lecture2 = v2.lecture;

  const v1Value =
    typeof lecture1?.availability === "string"
      ? (availabilityOrder[lecture1.availability] ?? -1)
      : -1;
  const v2Value =
    typeof lecture2?.availability === "string"
      ? (availabilityOrder[lecture2.availability] ?? -1)
      : -1;

  const availabilityDiff = v2Value - v1Value;
  if (availabilityDiff === 0) {
    const rating1 = lecture1?.professor_rating?.avgRating || 0;
    const rating2 = lecture2?.professor_rating?.avgRating || 0;
    const ratingDiff = rating2 - rating1;
    if (ratingDiff === 0) {
      const enrollment1 = parseInt(
        lecture1?.enrollment.split("/")[0] || "0",
        10,
      );
      const enrollment2 = parseInt(
        lecture2?.enrollment.split("/")[0] || "0",
        10,
      );
      return enrollment2 - enrollment1;
    }
    return ratingDiff;
  }

  return availabilityDiff;
}
