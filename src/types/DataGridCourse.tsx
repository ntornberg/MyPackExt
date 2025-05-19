import type { GridColDef } from "@mui/x-data-grid";
import { RateMyProfessorCell } from "../components/RateMyProfessorCell";
import { GradeDistributionCell } from "../components/GradeDistributionCell";

export const OpenCourseSectionsColumn: GridColDef[] = [
    { field: 'id', headerName: 'ID', hideable: true },
    { field: 'availability', headerName: 'Availability', flex: 2 },
    { field: 'section', headerName: 'Section', flex: 2 },
    { field: 'component', headerName: 'Component', flex: 2 }, 
    { field: 'enrollment', headerName: 'Enrollment', flex: 2 },
    { field: 'dayTime', headerName: 'Day Time', flex: 6 },
    { field: 'location', headerName: 'Location', flex: 6 },
    { 
      field: 'instructor_name', 
      headerName: 'Instructor', 
      flex: 6,
      renderCell: (params) => {
        const instructors = params.row.instructor_name;
        return Array.isArray(instructors) ? instructors.join(', ') : '';
      }
    },
    { 
      field: 'professor_rating', 
      headerName: 'Professor Rating', 
      flex: 4,
      renderCell: RateMyProfessorCell
    },
    { 
      field: 'grade_distribution', 
      headerName: 'Grade Distribution', 
      flex: 3,
      renderCell: GradeDistributionCell
    },
    { field: 'notes', headerName: 'Notes', flex: 2 },
    { field: 'requisites', headerName: 'Requisites', flex: 2 },
  ];
