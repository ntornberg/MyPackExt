import React from "react";
import { createRoot } from "react-dom/client";

import { ProfRatingCard } from "../../../../../degree-planning/components/DegreeAuditCards/ProfRatingCard";
import type {
  Course,
  MatchedRateMyProf,
  SingleCourseDataResponse,
} from "../../../../../types/api.ts";

/**
 * Creates a professor rating card component from course data.
 * @param {Course} course - The course to create the rating card for.
 * @param {SingleCourseDataResponse} data - The data to use for the card.
 * @returns {HTMLDivElement} - The HTML element containing the rating card.
 */
export function createProfessorCard(
  course: Course,
  data: SingleCourseDataResponse,
): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.id = "mypack-extension-data-prof";
  wrapper.style.marginTop = "0.5rem";
  wrapper.style.overflow = "visible";
  wrapper.style.maxWidth = "400px";
  wrapper.style.display = "inline-block";
  wrapper.style.verticalAlign = "top";

  const profInfo = data.RateMyProfInfo;

  // Check if there's any valid professor data
  if (
    !profInfo ||
    (!profInfo.avgRating &&
      !profInfo.master_name &&
      !profInfo.first_name &&
      !profInfo.last_name)
  ) {
    wrapper.textContent = "Professor not found.";
    return wrapper;
  }

  // Prepare professor data for the component
  const profData: MatchedRateMyProf = {
    master_name: profInfo.master_name ?? course.instructor,
    first_name: profInfo.first_name,
    last_name: profInfo.last_name,
    avgRating: profInfo.avgRating,
    department: profInfo.department,
    school: profInfo.school,
    id: profInfo.id,
  };

  // Render the professor rating card component
  const root = createRoot(wrapper);
  root.render(React.createElement(ProfRatingCard, profData));

  return wrapper;
}
