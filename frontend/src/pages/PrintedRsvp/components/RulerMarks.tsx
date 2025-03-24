import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface RulerMarksProps {
  size: number;
  horizontal?: boolean;
  pixelsPerInch: number;
}

export const RulerMarks: React.FC<RulerMarksProps> = ({ size, horizontal = true, pixelsPerInch }) => {
  const theme = useTheme();
  const marks = [];
  const step = pixelsPerInch / 4; // Quarter-inch marks
  
  for (let i = 0; i <= size; i += step) {
    const position = (i / size) * 100;
    const isMajorMark = i % pixelsPerInch < 1; // Major mark at each inch
    const isHalfInchMark = i % (pixelsPerInch / 2) < 1 && !isMajorMark; // Half-inch mark
    
    const markStyle = {
      position: 'absolute',
      backgroundColor: isMajorMark ? theme.palette.primary.main : 
                      isHalfInchMark ? theme.palette.secondary.main : 
                      'rgba(255, 255, 255, 0.7)',
      ...(horizontal 
        ? { 
            left: `${position}%`,
            top: 0,
            width: isMajorMark ? 3 : isHalfInchMark ? 2 : 1,
            height: isMajorMark ? 16 : isHalfInchMark ? 12 : 8 
          }
        : {
            top: `${position}%`,
            left: 0,
            height: isMajorMark ? 3 : isHalfInchMark ? 2 : 1,
            width: isMajorMark ? 16 : isHalfInchMark ? 12 : 8
          }
      )
    };
    
    // Add inch number label for major marks
    const label = isMajorMark ? (
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          ...(horizontal 
            ? { left: `${position}%`, top: 16, transform: 'translateX(-50%)' }
            : { top: `${position}%`, left: 16, transform: 'translateY(-50%)' }
          ),
          fontSize: '0.7rem',
          color: theme.palette.primary.contrastText
        }}
      >
        {Math.round(i / pixelsPerInch)}
      </Typography>
    ) : null;
    
    marks.push(
      <React.Fragment key={i}>
        <Box sx={markStyle} />
        {label}
      </React.Fragment>
    );
  }
  
  return <>{marks}</>;
};