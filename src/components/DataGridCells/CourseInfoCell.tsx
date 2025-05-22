import { IconButton, Tooltip, Box, Typography } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import InfoIcon from '@mui/icons-material/Info';
export const CourseInfoCell = (params: GridRenderCellParams) => {
    const { section, component, dayTime, location } = params.row;
    
    const tooltipContent = (
        <Box sx={{ p: 1, maxWidth: 300 }}>
            <Typography variant="subtitle2" fontWeight="bold">Section: {section}</Typography>
            <Typography variant="body2">Type: {component}</Typography>
            <Typography variant="body2">Time: {dayTime}</Typography>
            <Typography variant="body2">Location: {location}</Typography>
        </Box>
    );
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={tooltipContent} arrow>
                <IconButton size="small">
                    <InfoIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box> 
    );
};
