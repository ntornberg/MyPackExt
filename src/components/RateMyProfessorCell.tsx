import { Box, Typography, Rating } from '@mui/material';
import type { GridRenderCellParams } from '@mui/x-data-grid';

export const RateMyProfessorCell = (params: GridRenderCellParams) => {
  const { professor_rating  } = params.row;
  
  if (!professor_rating || !professor_rating.avgRating) {
    return <Typography variant="body2">No rating available</Typography>;
  }
  
  const rating = professor_rating.avgRating;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Rating
        value={rating}
        precision={0.1}
        readOnly
        size="small"
      />
      <Typography variant="body2">{rating.toFixed(1)}/5.0</Typography>
    </Box>
  );
}; 