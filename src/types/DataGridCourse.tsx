import type { GridColDef } from "@mui/x-data-grid";
import { RateMyProfessorCell } from "../components/DataGridCells/RateMyProfessorCell";
import { GradeDistributionCell } from "../components/DataGridCells/GradeDistributionCell";
import { ClassNotesCell } from "../components/DataGridCells/ClassNotesCell";
import { PrereqCell } from "../components/DataGridCells/PrereqCell";
import { ToCartButtonCell } from "../components/DataGridCells/ToCartButtonCell";
import { CourseInfoCell } from "../components/DataGridCells/CourseInfoCell";
import { StatusAndSlotsCell } from "../components/DataGridCells/StatusAndSlotsCell";

export const OpenCourseSectionsColumn: GridColDef[] = [
    { field: 'id', headerName: 'ID', hideable: true, minWidth: 60 },
    { 
      field: 'to_cart_button', 
      headerName: '', 
      flex: 1, 
      minWidth: 100, 
      renderCell: ToCartButtonCell,
      sortable: false,
      filterable: false
    },
    { 
      field: 'availability', 
      headerName: '', 
      flex: 1.5, 
      minWidth: 150, 
      renderCell: StatusAndSlotsCell,
      sortable: false,
      filterable: false
    },
    { 
      field: 'section', 
      headerName: 'Course Info', 
      flex: 2, 
      minWidth: 100, 
      renderCell: CourseInfoCell 
    },
    { 
      field: 'instructor_name', 
      headerName: 'Instructor', 
      flex: 2.5, 
      minWidth: 130,
      renderCell: (params) => {
        const instructors = params.row.instructor_name;
        return Array.isArray(instructors) ? instructors.join(', ') : '';
      }
    },
    { 
      field: 'professor_rating', 
      headerName: 'Rating', 
      flex: 1.5, 
      minWidth: 120,
      renderCell: RateMyProfessorCell
    },
    { 
      field: 'grade_distribution', 
      headerName: 'Grades', 
      flex: 1.5, 
      minWidth: 120,
      renderCell: GradeDistributionCell
    },
    { 
      field: 'notes', 
      headerName: '', 
      flex: 0.7, 
      minWidth: 50, 
      renderCell: ClassNotesCell,
      sortable: false,
      filterable: false
    },
    { 
      field: 'requisites', 
      headerName: '', 
      flex: 0.7, 
      minWidth: 50, 
      renderCell: PrereqCell,
      sortable: false,
      filterable: false
    },
  ];
