import React, { useCallback } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import TreeIcon from '@mui/icons-material/Nature';
import GrainIcon from '@mui/icons-material/Grain';
import { ForestRounded, ForestTwoTone, Park } from '@mui/icons-material';
import { useFamily } from '@/store/family';
import StickFigureIcon from '@/components/StickFigureIcon';
import Typography from '@mui/material/Typography';

interface LoadingBoxProps {
  isError?: boolean;
  errorMessage?: string;
}

const LoadingBox = ({ isError = false, errorMessage = "An error occurred. Please try again." }: LoadingBoxProps) => {

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateRandomContent = () => {
    const elements = [];
    const totalElements = 400;
    
    // Start collecting elements row by row
    const rows: JSX.Element[][] = [[]];
    let currentRow = 0;
    const elementsPerRow = Math.floor(Math.sqrt(totalElements));
    
    for (let i = 0; i < totalElements; i++) {
      // Start a new row if needed
      if (i > 0 && i % elementsPerRow === 0) {
        rows.push([]);
        currentRow++;
      }
      
      const random = Math.random();
      if (random < 0.25) {
        rows[currentRow].push(<React.Fragment key={`space-${i}`}>&nbsp;</React.Fragment>);
      } else if (random < 0.4) {
        rows[currentRow].push(
          <StickFigureIcon 
            loading={true} 
            fontSize='large' 
            key={`fig-${i}`} 
            color={isError ? 'error' : generateRandomColor()} 
            error={isError}
          />
        );
      } else if (random < 0.8) {
        if (i % 3 === 0) {
          rows[currentRow].push(<ForestTwoTone key={`tree1-${i}`} sx={{ color: i % 2 === 0 ? 'lightgreen' : 'darkgreen', fontSize: '2rem' }} />)
        }
        if (i % 3 === 1) {
          rows[currentRow].push(<ForestRounded key={`tree2-${i}`} sx={{ color: i % 2 === 0 ? 'lightgreen' : 'darkgreen', fontSize: '2rem' }} />)
        }
        if (i % 3 === 2) {
          rows[currentRow].push(<Park key={`tree3-${i}`} sx={{ color: i % 2 === 0 ? 'lightgreen' : 'darkgreen', fontSize: '2rem' }} />)
        }
      } else {
        const color1 = generateRandomColor();
        const color2 = generateRandomColor();
        const color3 = generateRandomColor();
        rows[currentRow].push(
          <GrainIcon
            key={`grain-${i}`}
            sx={{
              color: `${[color1, color2, color3][Math.floor(Math.random()*3)]}`,
              fontSize: '2rem',
            }}
          />
        );
      }
    }
    
    // If this is an error state, insert the error message around the 4th row
    if (isError && rows.length > 4) {
      // Create an error message row with proper padding
      const errorMessageRow = (
        <Box 
          key="error-message-row" 
          sx={{ 
            width: '100%', 
            textAlign: 'center', 
            px: 4, 
            py: 2,
            mt: 2,
            mb: 2,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0,0,0,.3)',
            borderRadius: '8px',
          }}
        >
          <Typography 
            variant="h5" 
            color="error.main" 
            fontWeight="bold"
            sx={{ 
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
              mb: 1
            }}
          >
            Connection Lost
          </Typography>
          <Typography color="error.main">
            {errorMessage}
          </Typography>
        </Box>
      );
      
      // Flatten all elements before the message
      const beforeMessage = rows.slice(0, 4).flat();
      // Flatten all elements after the message
      const afterMessage = rows.slice(4).flat();
      
      // Combine everything
      return [...beforeMessage, errorMessageRow, ...afterMessage];
    }
    
    // For loading state, just flatten all rows
    return rows.flat();
  }

  return (
    <StyledBox>
      {generateRandomContent()}
    </StyledBox>
  );
};

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  width: '70%',
  margin: '0 auto',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '16px',
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(0,0,0,.1)',
  borderRadius: '8px',
  boxShadow: theme.shadows[5],
}));

export default LoadingBox;