import { Box, Typography, Rating } from '@mui/material';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import type { MatchedRateMyProf } from '../types';
export const RateMyProfessorCell = (params: GridRenderCellParams) => {
  const { professor_rating} : { professor_rating: MatchedRateMyProf } = params.row;
  
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
        sx={{
          color: '#FFD700', // gold
          '& .MuiRating-iconFilled': {
            color: '#FFD700',
          },
          '& .MuiRating-iconHover': {
            color: '#FFD700',
          },
        }}
      />
    </Box>
  );
}; 