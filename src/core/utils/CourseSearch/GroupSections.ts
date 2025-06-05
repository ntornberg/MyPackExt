import type {GroupedSections, ModifiedSection} from "./MergeDataUtil";

import {AppLogger} from "../logger";
import type {CourseSection} from "./ParseRegistrarUtil";

// Used to group labs
export function groupSections(sections: CourseSection[],  courseSections?: Record<string, ModifiedSection>) {
    const groupedSections : Record<string, GroupedSections> = {};
    for (const section of sections) {
        const section_extract = section.id.match(/\d+/);
        if (section_extract) {
        if (!groupedSections[section_extract[0]]) {
            groupedSections[section_extract[0]] = { lecture: null, labs: [] };
        }
        if (section.component == 'Lec') {
            if (groupedSections[section_extract[0]].lecture != null) {
                AppLogger.warn("Lecture already exists for", section_extract[0]);
            }
            groupedSections[section_extract[0]].lecture = courseSections ? courseSections[section.id] : section;
        } else {
                groupedSections[section_extract[0]].labs?.push(courseSections ? courseSections[section.id] : section);
            }
        }

    }
    return groupedSections;
}