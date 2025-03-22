import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import EngagementPhoto1 from '@/assets/engagement-photos/topher_and_steph_rsvp1.jpg';
import EngagementPhoto2 from '@/assets/engagement-photos/topher_and_steph_rsvp2.jpg';
import EngagementPhoto3 from '@/assets/engagement-photos/topher_and_steph_rsvp3.jpg';
import EngagementPhoto4 from '@/assets/engagement-photos/topher_and_steph_rsvp8.jpg';

export const CardBackVertical: React.FC = () => {
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
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        gap: '4px',
        width: '100%',
        height: '100%',
        padding: '4px',
        boxSizing: 'border-box'
      }}>
        {/* Top area: Large main photo */}
        <Box 
          component="img" 
          src={EngagementPhoto2}
          alt="Engagement Photo 2" 
          sx={{ 
            gridColumn: '1',
            gridRow: '1 / span 2',
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center 30%',
            borderRadius: '4px'
          }} 
        />
        
        {/* Bottom area: Two smaller photos side by side */}
        <Box sx={{ 
          gridColumn: '1',
          gridRow: '3',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px'
        }}>
          {/* Bottom left */}
          <Box 
            component="img" 
            src={EngagementPhoto3}
            alt="Engagement Photo 3" 
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '4px'
            }} 
          />
          
          {/* Bottom right */}
          <Box 
            component="img" 
            src={EngagementPhoto4}
            alt="Engagement Photo 4" 
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '4px'
            }} 
          />
        </Box>
      </Box>
      
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