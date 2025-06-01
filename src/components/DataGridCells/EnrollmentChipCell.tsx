import { Chip } from "@mui/material";
import type { ModifiedSection } from "../../utils/CourseSearch/MergeDataUtil";
import { AppLogger } from "../../utils/logger";

function getEnrollmentColor(enrollment: string | undefined): string {
    AppLogger.info("Enrollment:", enrollment);
    if (!enrollment) return '#bdbdbd'; // grey for unknown
    const match = enrollment.match(/(\d+)\/(\d+)/);
    if (!match) return '#bdbdbd';
    const current = parseInt(match[1], 10);
    const max = parseInt(match[2], 10);
    if (isNaN(current) || isNaN(max) || max === 0) return '#bdbdbd';
    const ratio = current / max;
    // Green (low fill) to black (almost full)
    // 0.0 => red, 0.5 => yellow, 0.8 => green, 1.0 => black
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

export const EnrollmentChipCell = (params: ModifiedSection) => {
    const { enrollment } = params;
    const chipColor = getEnrollmentColor(enrollment);
    return <Chip label={enrollment} sx={{ backgroundColor: chipColor, color: '#fff', fontWeight: 600 }} />;
}; 