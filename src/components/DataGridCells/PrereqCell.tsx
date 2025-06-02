import { IconButton } from "@mui/material";
import { Tooltip } from "@mui/material";
import WarningIcon from '@mui/icons-material/Warning';
import type { ModifiedSection } from "../../utils/CourseSearch/MergeDataUtil";


export const PrereqCell = (params: ModifiedSection) => {
    const { requisites } = params;
    return (<Tooltip title={requisites}>
        <IconButton>
          <WarningIcon color="warning" />
        </IconButton>
      </Tooltip>);
};
