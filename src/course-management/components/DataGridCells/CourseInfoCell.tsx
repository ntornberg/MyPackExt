import {Box, Chip, IconButton, Tooltip, Typography} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import {CalendarView} from "./CalendarView";
import type {ModifiedSection} from "../../../core/utils/CourseSearch/MergeDataUtil.ts";


/**
 * Renders compact course information with a rich tooltip showing details and the calendar view.
 *
 * @param {ModifiedSection} params Section data used to render info and the calendar peek
 * @returns {JSX.Element} Info cell element
 */
export const CourseInfoCell = (params: ModifiedSection) => {
    
    const { section, component, dayTime, location } = params;
    
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
