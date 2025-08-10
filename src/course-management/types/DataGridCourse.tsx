import type { GridColDef } from "@mui/x-data-grid";
import { RateMyProfessorCell } from "../components/DataGridCells/RateMyProfessorCell";
import { GradeDistributionCell } from "../components/DataGridCells/GradeDistributionCell";

import { ToCartButtonCell } from "../components/DataGridCells/ToCartButtonCell";
import { CourseInfoCell } from "../components/DataGridCells/CourseInfoCell";
import { StatusAndSlotsCell } from "../components/DataGridCells/StatusAndSlotsCell";
import { InfoCell } from "../components/DataGridCells/InfoCell";
import type { GroupedSections } from "../../core/utils/CourseSearch/MergeDataUtil";

export function sortSections(v1: GroupedSections, v2: GroupedSections) {
  // Order should be Open,Reserved,Waitlist,Closed
  const order: Record<string, number> = { 
    "Open": 3, 
    "Reserved": 2, 
    "Waitlist": 1, 
    "Closed": 0 
  };
  const lecture1 = v1.lecture;
  const lecture2 = v2.lecture;
  

  const v1Value = typeof lecture1?.availability === 'string' ? order[lecture1.availability] ?? -1 : -1;
  const v2Value = typeof lecture2?.availability === 'string' ? order[lecture2.availability] ?? -1 : -1;
  
  const availabilityDiff = v2Value - v1Value;
  
  // If availability is equal, compare by professor rating
  if (availabilityDiff === 0) {
    const rating1 = lecture1?.professor_rating?.avgRating || 0;
    const rating2 = lecture2?.professor_rating?.avgRating || 0;
    return rating2 - rating1; // Higher rating first
  }
  
  return availabilityDiff;
}

export const OpenCourseSectionsColumn: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      hideable: true, 
      minWidth: 60,
      disableColumnMenu: true 
    },
   
    
    { 
      field: 'to_cart_button', 
      headerName: '', 
      flex: 1, 
      minWidth: 80, 
      renderCell: (params) => ToCartButtonCell(params.row),
      sortable: false,
      filterable: false,
      disableColumnMenu: true
    },
    { 
      field: 'availability', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 120, 
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => StatusAndSlotsCell(params.row),
      sortable: true,
      sortComparator: (v1, v2) => {
        const order: Record<string, number> = { 
          "Open": 3, 
          "Reserved": 2, 
          "Waitlist": 1, 
          "Closed": 0 
        };
        const val1 = typeof v1 === 'string' ? order[v1] ?? -1 : -1;
        const val2 = typeof v2 === 'string' ? order[v2] ?? -1 : -1;
        return val2 - val1;
      },
      filterable: false,
      disableColumnMenu: true
    },
    { 
      field: 'section', 
      headerName: 'Course Info', 
      align: 'left',
      headerAlign: 'center',
      flex: 1, 
      minWidth: 50, 
      renderCell: (params) => CourseInfoCell(params.row),
      sortable: false,
      filterable: false,
      disableColumnMenu: true
    },
    { 
      field: 'instructor_name', 
      headerName: 'Instructor', 
      flex: 2.5, 
      minWidth: 130,
      renderCell: (params) => {
        const instructors = params.row.instructor_name;
        return Array.isArray(instructors) ? instructors.join(', ') : '';
      },
      disableColumnMenu: true
    },
    { 
      field: 'professor_rating', 
      headerName: 'Rating', 
      flex: 1.5, 
      minWidth: 120,
      renderCell: (params) => RateMyProfessorCell(params.row),
      disableColumnMenu: true
    },
    { 
      field: 'grade_distribution', 
      headerName: 'Grades', 
      flex: 1.5, 
      minWidth: 120,
      renderCell: (params) => GradeDistributionCell(params.row),
      disableColumnMenu: true
    },
    { 
      field: 'info', 
      headerName: 'Info', 
      align: 'center',
      flex: 1, 
      minWidth: 70, 
      headerAlign: 'center',
      renderCell: (params) => InfoCell(params.row),
      sortable: false,
      filterable: false,
      disableColumnMenu: true
    }
  ];
