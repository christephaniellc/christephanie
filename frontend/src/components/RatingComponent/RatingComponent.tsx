import * as React from 'react';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

interface RatingComponentProps {
  score: number;
  numberOfRatings: number;
}

function RatingComponent({ score, numberOfRatings }: RatingComponentProps) {
  return (
    <Box
      sx={{
        '& > legend': { mt: 2 },
        mx: 'auto',
        justifyContent: 'center',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'baseline',
        flexWrap: 'wrap',
      }}
    >
      <Box width={'100%'} display={'flex'} alignItems={'center'} flexWrap="wrap" justifyContent='center' position="relative">
        <Rating name="simple-controlled" value={score} />
        <Typography variant="caption" sx={{ ml: 1 }}>
          {score}/5
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ ml: 1 }}>
        ({numberOfRatings} reviews on google maps)
      </Typography>
    </Box>
  );
}

export default RatingComponent;
