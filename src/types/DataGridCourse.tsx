import type { GridColDef } from "@mui/x-data-grid";
import { RateMyProfessorCell } from "../components/DataGridCells/RateMyProfessorCell";
import { GradeDistributionCell } from "../components/DataGridCells/GradeDistributionCell";
import { ClassNotesCell } from "../components/DataGridCells/ClassNotesCell";
import { PrereqCell } from "../components/DataGridCells/PrereqCell";
import { ToCartButtonCell } from "../components/DataGridCells/ToCartButtonCell";
import { CourseInfoCell } from "../components/DataGridCells/CourseInfoCell";
import { StatusAndSlotsCell } from "../components/DataGridCells/StatusAndSlotsCell";
import type { ModifiedSection } from "../utils/CourseSearch/MergeDataUtil";

export function sortSections(v1: ModifiedSection, v2: ModifiedSection) {
  // Order should be Open,Reserved,Waitlist,Closed
  const order: Record<string, number> = { 
    "Open": 3, 
    "Reserved": 2, 
    "Waitlist": 1, 
    "Closed": 0 
  };
  

  const v1Value = typeof v1.availability === 'string' ? order[v1.availability] ?? -1 : -1;
  const v2Value = typeof v2.availability === 'string' ? order[v2.availability] ?? -1 : -1;
  
  const availabilityDiff = v2Value - v1Value;
  
  // If availability is equal, compare by professor rating
  if (availabilityDiff === 0) {
    const rating1 = v1.professor_rating?.avgRating || 0;
    const rating2 = v2.professor_rating?.avgRating || 0;
    return rating2 - rating1; // Higher rating first
  }
  
  return availabilityDiff;
}

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
      minWidth: 50, 
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
