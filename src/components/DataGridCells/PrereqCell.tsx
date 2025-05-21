import type { GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';


export const PrereqCell = (params: GridRenderCellParams) => {
    const { prereqs } = params.row;
    return (<Tooltip title={prereqs}>
        <IconButton>
          <InfoIcon />
        </IconButton>
      </Tooltip>);
};
