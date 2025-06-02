import { Chip } from "@mui/material";
import type { ModifiedSection } from "../../utils/CourseSearch/MergeDataUtil";

export const CourseAvailibilityCell = (params: ModifiedSection) => {
    const { availability } = params;
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
