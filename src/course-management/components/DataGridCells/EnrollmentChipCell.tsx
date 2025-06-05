import {Chip} from "@mui/material";
import type {ModifiedSection} from "../../../core/utils/CourseSearch/MergeDataUtil.ts";


export const EnrollmentChipCell = (params: ModifiedSection) => {
    const { enrollment } = params;
    return <Chip label={enrollment} sx={{ backgroundColor: 'rgb(86, 100, 129)', color: '#fff', fontWeight: 600 }} />;
}; 