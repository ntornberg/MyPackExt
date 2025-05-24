import { IconButton, Tooltip, Box, Typography, Chip } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import InfoIcon from '@mui/icons-material/Info';
import { CalendarView } from "./CalendarView";

export const CourseInfoCell = (params: GridRenderCellParams) => {
    
    const { section, component, dayTime, location } = params.row;
    
    const tooltipContent = (
        <Box sx={{ p: 1, maxWidth: 800 }}>
            <Typography variant="subtitle2" fontWeight="bold">Section: {section}</Typography>
            <Typography variant="body2">Type: {component}</Typography>
            <Typography variant="body2">Time: {dayTime}</Typography>
            <Typography variant="body2">Location: {location}</Typography>
            <CalendarView {...params} />
        </Box>
    );
    
    return (
        <Box sx={{ maxWidth: 800, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip 
                placement="right-end" 
                title={tooltipContent} 
                arrow
                slotProps={{
                    tooltip: {
                        sx: {
                            maxWidth: '900px',
                            maxHeight: '800px',
                            height: 'auto',
                            width: 'auto',
                            bgcolor: 'background.paper',
                            color: 'text.primary',
                            boxShadow: 4,
                            fontSize: '0.875rem',
                            p: 0
                        }
                    }
                }}
            >
                <IconButton size="small">
                    <InfoIcon fontSize="small" />
                </IconButton>
               
            </Tooltip>
            {location.includes('Online') ? <Chip label="Online" size="small" /> : null}
        </Box> 
    );
};
