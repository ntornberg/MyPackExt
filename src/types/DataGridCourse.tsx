import type { GridColDef } from "@mui/x-data-grid";
import { RateMyProfessorCell } from "../components/RateMyProfessorCell";
import { GradeDistributionCell } from "../components/GradeDistributionCell";
import { CourseAvailibilityCell } from "../components/CourseAvailibilityCell";
import { ClassNotesCell } from "../components/ClassNotesCell";
import { PrereqCell } from "../components/PrereqCell";
import { EnrollmentChipCell } from "../components/EnrollmentChipCell";
import { ToCartButtonCell } from "../components/ToCartButtonCell";
export const OpenCourseSectionsColumn: GridColDef[] = [
    { field: 'id', headerName: 'ID', hideable: true, minWidth: 60 },
    { field: 'to_cart_button', headerName: 'Cart', flex: 2, minWidth: 120, renderCell: ToCartButtonCell },
    { field: 'availability', headerName: 'Status', flex: 2, minWidth: 120, renderCell: CourseAvailibilityCell },
    { field: 'enrollment', headerName: 'Slots', flex: 2, minWidth: 120, renderCell: EnrollmentChipCell },
    { field: 'section', headerName: 'Section', flex: 2, minWidth: 100 },
    { field: 'component', headerName: 'Type', flex: 2, minWidth: 100 }, 
   
    { field: 'dayTime', headerName: 'Time', flex: 3, minWidth: 140 },
    { field: 'location', headerName: 'Location', flex: 3, minWidth: 140 },
    { 
      field: 'instructor_name', 
      headerName: 'Instructor', 
      flex: 3, minWidth: 140,
      renderCell: (params) => {
        const instructors = params.row.instructor_name;
        return Array.isArray(instructors) ? instructors.join(', ') : '';
      }
    },
    { 
      field: 'professor_rating', 
      headerName: 'Professor Rating', 
      flex: 2, minWidth: 130,
      renderCell: RateMyProfessorCell
    },
    { 
      field: 'grade_distribution', 
      headerName: 'Grade Distribution', 
      flex: 2, minWidth: 150,
      renderCell: GradeDistributionCell
    },
    { field: 'notes', headerName: 'Notes', flex: 1, minWidth: 80, renderCell: ClassNotesCell },
    { field: 'requisites', headerName: 'Requisites', flex: 1, minWidth: 80, renderCell: PrereqCell },
  ];
