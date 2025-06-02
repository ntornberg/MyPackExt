import { createRoot } from 'react-dom/client';
import React from "react";
import { createShadowHost } from '../../../../utils/dom';
import { GradeCard } from '../../../../components/DegreeAuditCards/GradeCard';
import type { Course } from '../../../../types/SupaBaseResponseType';
import type { GradeData } from '../../../../types/SupaBaseResponseType';
import type { SingleCourseDataResponse } from '../../types';

/**
 * Creates a grade card component from course data.
 * @param {Course} course - The course to create the grade card for.
 * @param {SingleCourseDataResponse} data - The data to use for the card.
 * @returns {HTMLDivElement} - The HTML element containing the grade card.
 */
export function createGradeCard(course: Course, data: SingleCourseDataResponse): HTMLDivElement {
  const { host: wrapper, container } = createShadowHost("mypack-extension-data-grade");
  wrapper.style.marginTop = "0.5rem";
  wrapper.style.overflow = 'visible';
  wrapper.style.maxWidth = "400px";
  wrapper.style.display = 'inline-block';
  wrapper.style.verticalAlign = 'top';

  const courseData = data.CourseData;
  
  // Extract and parse grade data
  const a = parseFloat(courseData.a_average ?? "0");
  const b = parseFloat(courseData.b_average ?? "0");
  const c = parseFloat(courseData.c_average ?? "0");
  const d = parseFloat(courseData.d_average ?? "0");
  const f = parseFloat(courseData.f_average ?? "0");

  // Check if there's any valid grade data
  const total = a + b + c + d + f;
  if (!total || isNaN(total)) {
    wrapper.textContent = "No grade data available.";
    return wrapper;
  }

  // Prepare grade data for the component
  const gradeData: GradeData = {
    course_name: courseData.course_name ?? course.abr,
    subject: courseData.subject ?? "",
    instructor_name: courseData.instructor_name ?? course.instructor,
    a_average: a,
    b_average: b,
    c_average: c,
    d_average: d,
    f_average: f,
    class_avg_min: courseData.class_avg_min ? parseFloat(courseData.class_avg_min) : 0,
    class_avg_max: courseData.class_avg_max ? parseFloat(courseData.class_avg_max) : 0,
  };

  // Render the grade card component
  const root = createRoot(container);
  root.render(React.createElement(GradeCard, gradeData));
  
  return wrapper;
} 