import { createRoot } from 'react-dom/client';
import type {Course, GradeData, MatchedRateMyProf} from '../types';
import { AppLogger } from '../utils/logger';
import { createShadowHost } from '../utils/dom';
import { GradeCard } from '../components/GradeCard';
import { ProfRatingCard } from '../components/ProfRatingCard';
import React from "react";

/**
 * Fetches course grade details from the backend API.
 * @param {Course} course - The course to fetch details for.
 * @returns {Promise<HTMLDivElement>} - A promise that resolves with an HTML element containing the course data.
 */
export async function getCourseDetails(course: Course): Promise<HTMLDivElement> {
    console.log("Fetching course details for:", course);
    const {host: wrapper, container} = createShadowHost("mypack-extension-data-grade");
    wrapper.style.marginTop = "0.5rem";
    wrapper.style.overflow = 'visible';   // not 'auto'

    wrapper.style.maxWidth = "400px";
    wrapper.style.display = 'inline-block';
    wrapper.style.verticalAlign = 'top';
    try {
        const url = `https://app-gradefetchbackend.azurewebsites.net/api/FetchGradeData?courseName=${encodeURIComponent(course.abr)}&professorName=${encodeURIComponent(course.instructor)}`;
        const response = await fetch(url);

        if (!response.ok) {
            AppLogger.error("Error fetching course details:", response.status, response.statusText);
            wrapper.textContent = "No grade data available.";
            return wrapper;
        }

        const json = await response.json();
        console.log(json);
        const root = createRoot(container);
        const a = parseFloat(json.AAverage ?? "0");
        const b = parseFloat(json.BAverage ?? "0");
        const c = parseFloat(json.CAverage ?? "0");
        const d = parseFloat(json.DAverage ?? "0");
        const f = parseFloat(json.FAverage ?? "0");

        // If all are null or 0, skip rendering
        const total = a + b + c + d + f;
        if (!total || isNaN(total)) {
            AppLogger.info("No valid grade data found. Skipping GradeCard.");
            wrapper.textContent = "No grade data available.";
            return wrapper;
        }
        const gradeData: GradeData = {
            courseName: json.CourseName,
            subject: json.Subject,
            instructorName: json.InstructorName,
            aAverage: parseFloat(json.AAverage ?? "0"),
            bAverage: parseFloat(json.BAverage ?? "0"),
            cAverage: parseFloat(json.CAverage ?? "0"),
            dAverage: parseFloat(json.DAverage ?? "0"),
            fAverage: parseFloat(json.FAverage ?? "0"),
            classAverageMin: json.ClassAverageMin ? parseFloat(json.ClassAverageMin) : 0,
            classAverageMax: json.ClassAverageMax ? parseFloat(json.ClassAverageMax) : 0,
        };

        root.render(React.createElement(GradeCard, gradeData));
        return wrapper;

    } catch (error) {
        AppLogger.error("Exception while fetching course details:", error);
        wrapper.textContent = "Error loading data.";
        return wrapper;
    }
}

/**
 * Fetches professor rating details from the backend API.
 * @param {string} profName - The name of the professor to fetch details for.
 * @returns {Promise<HTMLDivElement>} - A promise that resolves with an HTML element containing the professor data.
 */
export async function getProfessorDetails(profName: string): Promise<HTMLDivElement> {
    console.log("Fetching RateMyProfessor data for: ", profName);
    const wrapper = document.createElement("div");
    wrapper.id = "mypack-extension-data-prof";
    wrapper.style.marginTop = "0.5rem";
    wrapper.style.overflow = 'visible';   // not 'auto'

    wrapper.style.maxWidth = "400px";
    wrapper.style.display = 'inline-block';
    wrapper.style.verticalAlign = 'top';
    try {
        const url = `https://app-gradefetchbackend.azurewebsites.net/api/FetchRateMyProfData?&professorName=${encodeURIComponent(profName)}`;
        const response = await fetch(url);

        if (!response.ok) {
            AppLogger.error("Error fetching professor details.", response.status, response.statusText);
            wrapper.textContent = "Professor not found.";
            return wrapper;
        }
        const json = await response.json();
        const root = createRoot(wrapper);
        console.log(json);
        const profData: MatchedRateMyProf = {
            master_name: json.MasterName,
            first_name: json.FirstName,
            last_name: json.LastName,
            avgRating: parseFloat(json.AvgRating ?? "0"),
            department: json.Department,
            school: json.School,
            id: json.Id,
        }
        root.render(React.createElement(ProfRatingCard, profData));
        return wrapper;
    } catch (error) {
        AppLogger.error("Exception while fetching course details:", error);
        wrapper.textContent = "Error loading data.";
        return wrapper;
    }
}
