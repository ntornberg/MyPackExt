import {ClassNotesCell} from "./ClassNotesCell";

import {PrereqCell} from "./PrereqCell";
import type {ModifiedSection} from "../../../core/utils/CourseSearch/MergeDataUtil.ts";

/**
 * Displays class notes and prerequisites icons if present for the section.
 * Returns null if neither is present.
 *
 * @param {ModifiedSection} params Section data
 * @returns {JSX.Element | null} Combined info cell or null
 */
export const InfoCell = (params: ModifiedSection) => {
    const hasRequisites = params.requisites && 
                          params.requisites !== '';
    const hasNotes = params.notes && params.notes.trim() !== '';
  
    // If no info to display, return null
    if (!hasRequisites && !hasNotes) {
      return null;
    }
    
    // Return both cells side by side if both have content
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {hasNotes && <ClassNotesCell {...params} />}
        {hasRequisites && <PrereqCell {...params} />}
      </div>
    );
  };