import { Box, Chip } from "@mui/material";
import type { ModifiedSection } from "../../utils/CourseSearch/MergeDataUtil";

function getEnrollmentColor(enrollment: string | undefined): string {
    if (!enrollment) return '#bdbdbd'; // grey for unknown
    const match = enrollment.match(/(\d+)\/(\d+)/);
    if (!match) return '#bdbdbd';
    const current = parseInt(match[1], 10);
    const max = parseInt(match[2], 10);
    if (isNaN(current) || isNaN(max) || max === 0) return '#bdbdbd';
    const ratio = current / max;
    // This doesn't even work
    if (ratio < 0.5) {
        // Red to yellow
        const g = Math.round(255 * (ratio / 0.5));
        return `rgb(255,${g},0)`;
    } else if (ratio < 0.8) {
        // Yellow to green
        const r = Math.round(255 * (1 - (ratio - 0.5) / 0.3));
        return `rgb(${r},255,0)`;
    } else if (ratio < 0.98) {
        // Green to black
        const v = Math.round(255 * (1 - (ratio - 0.8) / 0.18));
        return `rgb(0,${v},0)`;
    } else {
        // Nearly full: black
        return '#111';
    }
}

export const StatusAndSlotsCell = (params: ModifiedSection) => {
    const { availability, enrollment,section } = params;
    
    let statusColor = "success";
    if(availability === "Open"){
        statusColor = "success";
    } else if(availability === "Closed"){
        statusColor = "error";
    } else if(availability === "Waitlist"){
        statusColor = "warning";
    } else if(availability === "Reserved"){
        statusColor = "info";
    }
    
    const chipColor = getEnrollmentColor(enrollment);
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
                label={availability} 
                color={statusColor as any} 
                size="small"
                sx={{ fontSize: {xs: '0.7rem', sm: '0.75rem', md: '0.8rem'} }}
            />
            <Chip 
                label={enrollment} 
                size="small"
                sx={{ 
                    backgroundColor: chipColor, 
                    color: '#fff', 
                    fontWeight: 600,
                    fontSize: {xs: '0.7rem', sm: '0.75rem', md: '0.8rem'}
                }} 
            />
            <Chip 
                label={section} 
                size="small"
                sx={{ 
                    backgroundColor: '#000', 
                    color: '#fff', 
                    fontWeight: 600,
                    fontSize: {xs: '0.7rem', sm: '0.75rem', md: '0.8rem'}
                }} 
            />
        </Box>
    );
}; 