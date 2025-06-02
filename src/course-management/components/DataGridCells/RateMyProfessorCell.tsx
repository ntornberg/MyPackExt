import { Box, Typography, Rating } from '@mui/material';
import type { ModifiedSection } from '../../utils/CourseSearch/MergeDataUtil';

export const RateMyProfessorCell = (params: ModifiedSection) => {
  const { professor_rating} = params;
  
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
          '& .MuiRating-iconFilled, & .MuiRating-iconFilled .MuiSvgIcon-root, & .MuiRating-iconFilled svg': {
            color: '#FFD700 !important',
            fill: '#FFD700 !important',
          },
          '& .MuiRating-iconEmpty, & .MuiRating-iconEmpty .MuiSvgIcon-root, & .MuiRating-iconEmpty svg': {
            color: '#B0B0B0 !important',
            fill: '#B0B0B0 !important',
          },
          '& .MuiRating-iconHover': {
            color: '#FFD700 !important',
            fill: '#FFD700 !important',
          },
        }}
      />
    </Box>
  );
}; 