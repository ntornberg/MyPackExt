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
      sortable: true,
      sortComparator: (v1, v2, param1, param2) => {
        // Order should be Open,Reserved,Waitlist,Closed
        const order: Record<string, number> = { 
          "Open": 0, 
          "Reserved": 1, 
          "Waitlist": 2, 
          "Closed": 3 
        };
        
        // Compare availability status first
        const availabilityDiff = (order[String(v1)] || 4) - (order[String(v2)] || 4);
        
        // If availability is equal, compare by professor rating
        if (availabilityDiff === 0) {
          const rating1 = param1.api.getCellValue(param1.id, 'professor_rating')?.avgRating || 0;
          const rating2 = param2.api.getCellValue(param2.id, 'professor_rating')?.avgRating || 0;
          return rating2 - rating1; // Higher rating first
        }
        
        return availabilityDiff;
      },
      filterable: false
    },
    { 
      field: 'section', 
      headerName: 'Course Info', 
      flex: 2, 
      minWidth: 80, 
      renderCell: CourseInfoCell,
      sortable: false,
      filterable: false
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
