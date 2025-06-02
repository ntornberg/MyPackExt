import { IconButton } from "@mui/material";
import { Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import type { ModifiedSection } from "../../utils/CourseSearch/MergeDataUtil";

export const ClassNotesCell = (params: ModifiedSection) => {
    const { notes } = params;
    return (<Tooltip title={notes}>
        <IconButton>
          <InfoIcon />
        </IconButton>
      </Tooltip>);
};
