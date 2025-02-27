import React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import StickFigureIcon from '@mui/icons-material/Accessibility';
import TreeIcon from '@mui/icons-material/Nature';
import GrainIcon from '@mui/icons-material/Grain';
import { ForestRounded, ForestTwoTone, Park } from '@mui/icons-material';

const LoadingBox = () => {
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
    for (let i = 0; i < totalElements; i++) {
      const random = Math.random();
      if (random < 0.25) {
        elements.push(<>&nbsp;</>);
      } else if (random < 0.4) {
        elements.push(
          <StickFigureIcon key={i} sx={{ color: generateRandomColor(), fontSize: '2rem' }} />
        );
      } else if (random < 0.8) {
        if (i % 3 === 0) {
          elements.push(<ForestTwoTone key={i} sx={{ color: i % 2 === 0 ? 'lightgreen' : 'darkgreen', fontSize: '2rem' }} />)
        }
        if (i % 3 === 1) {
          elements.push(<ForestRounded key={i} sx={{ color: i % 2 === 0 ? 'lightgreen' : 'darkgreen', fontSize: '2rem' }} />)
        }
        if (i % 3 === 2) {
          elements.push(<Park key={i} sx={{ color: i % 2 === 0 ? 'lightgreen' : 'darkgreen', fontSize: '2rem' }} />)
        }
      } else {
        const color1 = generateRandomColor();
        const color2 = generateRandomColor();
        const color3 = generateRandomColor();
        const random360deg = Math.floor(Math.random() * 360);
        elements.push(
          <GrainIcon
            key={i}
            sx={{
              background: `linear-gradient(${random360deg}deg, ${color1}, ${color2}, ${color3})`,
              fontSize: '2rem',
            }}
          />
        );
      }
    }
    return elements;
  };

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