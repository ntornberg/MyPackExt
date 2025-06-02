import { Chip } from "@mui/material";
import type { ModifiedSection } from "../../utils/CourseSearch/MergeDataUtil";



export const EnrollmentChipCell = (params: ModifiedSection) => {
    const { enrollment } = params;
    return <Chip label={enrollment} sx={{ backgroundColor: 'rgb(86, 100, 129)', color: '#fff', fontWeight: 600 }} />;
}; 