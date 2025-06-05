import {IconButton, Tooltip} from "@mui/material";
import WarningIcon from '@mui/icons-material/Warning';
import type {ModifiedSection} from "../../../core/utils/CourseSearch/MergeDataUtil.ts";



export const PrereqCell = (params: ModifiedSection) => {
    const { requisites } = params;
    return (<Tooltip title={requisites}>
        <IconButton>
          <WarningIcon color="warning" />
        </IconButton>
      </Tooltip>);
};
