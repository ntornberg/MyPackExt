import { useState } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import type { GradeData } from '../../types';
import { AppLogger } from '../../utils/logger';

export const GradeDistributionCell = (params: GridRenderCellParams) => {
  const [open, setOpen] = useState(false);
  const { grade_distribution } = params.row;
  
  if (!grade_distribution) {
    return <Typography variant="body2">No grade data</Typography>;
  }
  AppLogger.info("Grade distribution: ", grade_distribution);
  AppLogger.info("Grade distribution row: ", params.row);
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const { 
    a_average, 
    b_average, 
    c_average, 
    d_average, 
    f_average, 
    course_name,
    instructor_name 
  } = grade_distribution as GradeData;
  
  const total = a_average + b_average + c_average + d_average + f_average;
  
  const pieData = [
    { id: 0, value: (a_average / total) * 100, label: 'A', color: '#4caf50' },
    { id: 1, value: (b_average / total) * 100, label: 'B', color: '#8bc34a' },
    { id: 2, value: (c_average / total) * 100, label: 'C', color: '#ffeb3b' },
    { id: 3, value: (d_average / total) * 100, label: 'D', color: '#ff9800' },
    { id: 4, value: (f_average / total) * 100, label: 'F', color: '#f44336' },
  ];
  
  return (
    <>
      <Button 
        variant="outlined" 
        size="small" 
        onClick={handleOpen}
        sx={{ textTransform: 'none' }}
      >
        View Grades
      </Button>
      
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Grade Distribution for {course_name}
          <Typography variant="subtitle2" color="text.secondary">
            Instructor: {instructor_name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', height: 300 }}>
            <PieChart
              series={[
                {
                  data: pieData,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  arcLabel: (item) => `${item.value.toFixed(1)}%`,
                },
              ]}
              height={300}
              margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
              slotProps={{
                legend: {
                  position: { vertical: 'bottom', horizontal: 'center' },
                },
              }}
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" align="center">
              Grade Breakdown
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
              {pieData.map((grade) => (
                <Box key={grade.id} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ color: grade.color, fontWeight: 'bold' }}>
                    {grade.label}
                  </Typography>
                  <Typography variant="body2">
                    {grade.value.toFixed(1)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}; 