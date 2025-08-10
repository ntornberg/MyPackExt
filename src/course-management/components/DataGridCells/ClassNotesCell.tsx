import {IconButton, Tooltip} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import type {ModifiedSection} from "../../../core/utils/CourseSearch/MergeDataUtil.ts";


/**
 * Displays a tooltip icon with class notes when present.
 *
 * @param {ModifiedSection} params Section containing `notes`
 * @returns {JSX.Element} Tooltip with info icon
 */
export const ClassNotesCell = (params: ModifiedSection) => {
    const { notes } = params;
    return (<Tooltip title={notes}>
        <IconButton>
          <InfoIcon />
        </IconButton>
      </Tooltip>);
};
