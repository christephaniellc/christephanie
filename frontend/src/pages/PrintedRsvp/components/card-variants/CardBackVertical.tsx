import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { PhotoGrid } from '../PhotoGrid';

interface CardBackVerticalProps {
  previewOnly?: boolean;
}

export const CardBackVertical: React.FC<CardBackVerticalProps> = ({ previewOnly = false }) => {
  const theme = useTheme();

  return (
    <Paper 
      elevation={8}
      className="card-back-vertical"
      sx={{
        width: 384, // 4 inches @ 96ppi
        height: 576, // 6 inches @ 96ppi
        backgroundColor: '#121212', // Dark background like the website
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}
    >
      {/* Grid layout for photos - rearranged for vertical format */}
      <PhotoGrid 
        orientation="vertical" 
        showControls={false}
        interactivePreview={false}
      />
      
      {/* Subtle branding overlay */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        pointerEvents: 'none'
      }} />
      
      {/* Date text */}
      <Box 
        sx={{
          position: 'absolute',
          bottom: 15,
          right: 15,
          color: theme.palette.secondary.main,
          fontSize: '1.2rem',
          filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.7))',
          opacity: 0.8,
          fontFamily: 'Snowstorm, serif'
        }}
      >
        July 5, 2025
      </Box>
      
      {/* Subtle branding */}
      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 15,
          fontFamily: 'Snowstorm, serif',
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.7)',
          textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
        }}
      >
        Christopher & Stephanie
      </Typography>
    </Paper>
  );
};