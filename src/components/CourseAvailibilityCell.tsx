import { Chip } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";

export const CourseAvailibilityCell = (params: GridRenderCellParams) => {
    const { availability } = params.row;
    let color = "success";
    if(availability === "Open"){
        color = "success";
    } else if(availability === "Closed"){
        color = "error";
    } else if(availability === "Waitlist"){
        color = "warning";
    } else if(availability === "Reserved"){
        color = "info";
    }
    return <Chip label={availability} color={color as any} />;
};
