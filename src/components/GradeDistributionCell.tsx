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
import type { GradeData } from '../types';

export const GradeDistributionCell = (params: GridRenderCellParams) => {
  const [open, setOpen] = useState(false);
  const { grade_distribution } = params.row;
  
  if (!grade_distribution) {
    return <Typography variant="body2">No grade data</Typography>;
  }
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const { 
    aAverage, 
    bAverage, 
    cAverage, 
    dAverage, 
    fAverage, 
    courseName,
    instructorName 
  } = grade_distribution as GradeData;
  
  const total = aAverage + bAverage + cAverage + dAverage + fAverage;
  
  const pieData = [
    { id: 0, value: (aAverage / total) * 100, label: 'A', color: '#4caf50' },
    { id: 1, value: (bAverage / total) * 100, label: 'B', color: '#8bc34a' },
    { id: 2, value: (cAverage / total) * 100, label: 'C', color: '#ffeb3b' },
    { id: 3, value: (dAverage / total) * 100, label: 'D', color: '#ff9800' },
    { id: 4, value: (fAverage / total) * 100, label: 'F', color: '#f44336' },
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
          Grade Distribution for {courseName}
          <Typography variant="subtitle2" color="text.secondary">
            Instructor: {instructorName}
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