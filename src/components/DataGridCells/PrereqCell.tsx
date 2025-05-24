import type { GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { Tooltip } from "@mui/material";
import WarningIcon from '@mui/icons-material/Warning';


export const PrereqCell = (params: GridRenderCellParams) => {
    const { requisites } = params.row;
    return (<Tooltip title={requisites}>
        <IconButton>
          <WarningIcon color="warning" />
        </IconButton>
      </Tooltip>);
};
