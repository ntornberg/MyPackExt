import {IconButton, Tooltip} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import type {ModifiedSection} from "../../../core/utils/CourseSearch/MergeDataUtil.ts";


export const ClassNotesCell = (params: ModifiedSection) => {
    const { notes } = params;
    return (<Tooltip title={notes}>
        <IconButton>
          <InfoIcon />
        </IconButton>
      </Tooltip>);
};
