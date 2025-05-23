import type { GridColDef } from "@mui/x-data-grid";
import { RateMyProfessorCell } from "../components/DataGridCells/RateMyProfessorCell";
import { GradeDistributionCell } from "../components/DataGridCells/GradeDistributionCell";
import { ClassNotesCell } from "../components/DataGridCells/ClassNotesCell";
import { PrereqCell } from "../components/DataGridCells/PrereqCell";
import { ToCartButtonCell } from "../components/DataGridCells/ToCartButtonCell";
import { CourseInfoCell } from "../components/DataGridCells/CourseInfoCell";
import { StatusAndSlotsCell } from "../components/DataGridCells/StatusAndSlotsCell";
import type { ModifiedSection } from "../utils/CourseSearch/MergeDataUtil";
import { AppLogger } from "../utils/logger";

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

// Combined cell for both notes and prerequisites
const InfoCell = (params: any) => {
  AppLogger.info("InfoCell params:", params);
  const hasRequisites = params.row.requisites && 
                        params.row.requisites !== '';
  const hasNotes = params.row.notes && params.row.notes.trim() !== '';
  AppLogger.info("hasRequisites:", hasRequisites);
  AppLogger.info("hasNotes:", hasNotes);
  // If no info to display, return null
  if (!hasRequisites && !hasNotes) {
    return null;
  }
  
  // Return both cells side by side if both have content
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {hasNotes && <ClassNotesCell {...params} />}
      {hasRequisites && <PrereqCell {...params} />}
    </div>
  );
};

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
      renderCell: ToCartButtonCell,
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
      renderCell: StatusAndSlotsCell,
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
      renderCell: CourseInfoCell,
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
      renderCell: RateMyProfessorCell,
      disableColumnMenu: true
    },
    { 
      field: 'grade_distribution', 
      headerName: 'Grades', 
      flex: 1.5, 
      minWidth: 120,
      renderCell: GradeDistributionCell,
      disableColumnMenu: true
    },
    { 
      field: 'info', 
      headerName: 'Info', 
      align: 'center',
      flex: 1, 
      minWidth: 70, 
      headerAlign: 'center',
      renderCell: InfoCell,
      sortable: false,
      filterable: false,
      disableColumnMenu: true
    }
  ];
