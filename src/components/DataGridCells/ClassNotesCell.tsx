import { IconButton } from "@mui/material";
import { Tooltip } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import InfoIcon from '@mui/icons-material/Info';

export const ClassNotesCell = (params: GridRenderCellParams) => {
    const { notes } = params.row;
    return (<Tooltip title={notes}>
        <IconButton>
          <InfoIcon />
        </IconButton>
      </Tooltip>);
};
