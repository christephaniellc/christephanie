import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import EngagementPhoto1 from '@/assets/engagement-photos/topher_and_steph_rsvp1.jpg';
import EngagementPhoto2 from '@/assets/engagement-photos/topher_and_steph_rsvp2.jpg';
import EngagementPhoto3 from '@/assets/engagement-photos/topher_and_steph_rsvp3.jpg';
import EngagementPhoto4 from '@/assets/engagement-photos/topher_and_steph_rsvp4.jpg';

interface CardBackSideProps {
  actualCardWidth: number;
  actualCardHeight: number;
  cardScale: number;
}

export const CardBackSide: React.FC<CardBackSideProps> = ({
  actualCardWidth,
  actualCardHeight,
  cardScale
}) => {
  const theme = useTheme();

  return (
    <Paper 
      elevation={8}
      className="back-card"
      sx={{
        width: `${actualCardWidth}px`,
        height: `${actualCardHeight}px`,
        backgroundColor: '#121212', // Dark background like the website
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        transform: `scale(${cardScale})`,
        transformOrigin: 'top left'
      }}
    >
      {/* Grid layout for photos */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        gap: '4px',
        width: '100%',
        height: '100%',
        padding: '4px',
        boxSizing: 'border-box'
      }}>
        {/* Top left: EngagementPhoto3 */}
        <Box 
          component="img" 
          src={`${EngagementPhoto1}`}
          alt="Engagement Photo 1" 
          sx={{ 
            gridColumn: '1',
            gridRow: '1',
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '4px',
            //transform: 'rotate(90deg) scale(1.5)',
            transformOrigin: 'center'
          }} 
        />
        
        {/* Top right with full height: EngagementPhoto2 */}
        <Box 
          component="img" 
          src={`${EngagementPhoto2}`}
          alt="Engagement Photo 2" 
          sx={{ 
            gridColumn: '2',
            gridRow: '1 / span 3',
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center 40%',
            borderRadius: '4px',
            transform: 'translateY(-50%) scale(0.8)',
            //transform: 'rotate(90deg) scale(1.5)',
            transformOrigin: 'center'
          }} 
        />
        
        {/* Middle row: EngagementPhoto4 */}
        <Box 
          component="img" 
          src={`${EngagementPhoto4}`}
          alt="Engagement Photo 4" 
          sx={{ 
            gridColumn: '1',
            gridRow: '2',
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center 30%',
            borderRadius: '4px',
           //transform: 'rotate(90deg) scale(1.5)',
            transformOrigin: 'center'
          }} 
        />
        
        {/* Bottom row: EngagementPhoto1 */}
        <Box 
          component="img" 
          src={`${EngagementPhoto3}`}
          alt="Engagement Photo 3" 
          sx={{ 
            gridColumn: '1',
            gridRow: '3',
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center 40%',
            borderRadius: '4px',
            //transform: 'rotate(90deg) scale(1.5)',
            transformOrigin: 'center'
          }} 
        />
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
      
      {/* Decorative element - Heart icon */}
      <Box 
        sx={{
          position: 'absolute',
          bottom: 15,
          right: 15,
          color: theme.palette.secondary.main,
          fontSize: '1.5rem',
          filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.7))',
          opacity: 0.8
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
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.7)',
          textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
        }}
      >
        Topher & Steph
      </Typography>
    </Paper>
  );
};