import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

interface NeonTitleProps {
  text: string;
  subText?: string;
  glowColor?: string;
  textColor?: string;
  fontSize?: string | number;
  subFontSize?: string | number;
  pulsate?: boolean;
  flicker?: boolean;
}

// Create keyframes for animations
const createPulsateKeyframes = (glowColor: string) => {
  return `
    @keyframes pulsate {
      0% {
        text-shadow: 
          0 0 4px ${glowColor},
          0 0 11px ${glowColor},
          0 0 19px ${glowColor},
          0 0 40px ${alpha(glowColor, 0.6)},
          0 0 80px ${alpha(glowColor, 0.4)},
          0 0 90px ${alpha(glowColor, 0.2)},
          0 0 100px ${alpha(glowColor, 0.1)},
          0 0 150px ${alpha(glowColor, 0.05)};
      }
      100% {
        text-shadow: 
          0 0 4px ${glowColor},
          0 0 10px ${glowColor},
          0 0 18px ${glowColor},
          0 0 38px ${alpha(glowColor, 0.8)},
          0 0 73px ${alpha(glowColor, 0.6)},
          0 0 80px ${alpha(glowColor, 0.4)},
          0 0 94px ${alpha(glowColor, 0.2)},
          0 0 140px ${alpha(glowColor, 0.1)};
      }
    }
  `;
};

const createFlickerKeyframes = (glowColor: string) => {
  return `
    @keyframes flicker {
      0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
        opacity: 0.99;
        text-shadow: 
          0 0 7px ${glowColor},
          0 0 10px ${glowColor},
          0 0 21px ${glowColor},
          0 0 42px ${alpha(glowColor, 0.8)},
          0 0 82px ${alpha(glowColor, 0.6)},
          0 0 92px ${alpha(glowColor, 0.4)},
          0 0 102px ${alpha(glowColor, 0.2)},
          0 0 151px ${alpha(glowColor, 0.1)};
      }
      20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
        opacity: 0.4;
        text-shadow: none;
      }
    }
  `;
};

const NeonTitle: React.FC<NeonTitleProps> = ({
  text,
  subText,
  glowColor: customGlowColor,
  textColor = '#fff',
  fontSize = '2.5rem',
  subFontSize = '1.2rem',
  pulsate = true,
  flicker = false
}) => {
  const theme = useTheme();
  const glowColor = customGlowColor || theme.palette.secondary.main;
  
  // Create base neon text shadow
  const neonTextShadow = `
    0 0 7px ${glowColor},
    0 0 10px ${glowColor},
    0 0 21px ${glowColor},
    0 0 42px ${alpha(glowColor, 0.8)},
    0 0 82px ${alpha(glowColor, 0.6)},
    0 0 92px ${alpha(glowColor, 0.4)},
    0 0 102px ${alpha(glowColor, 0.2)},
    0 0 151px ${alpha(glowColor, 0.1)}
  `;
  
  // Create subtitle text shadow (lighter effect)
  const subtitleTextShadow = `
    0 0 4px ${glowColor},
    0 0 8px ${glowColor},
    0 0 15px ${alpha(glowColor, 0.6)}
  `;
  
  // Determine which animation to use
  const animationStyle = pulsate 
    ? 'pulsate 1.5s infinite alternate' 
    : (flicker ? 'flicker 3s linear infinite' : 'none');
  
  return (
    <Box 
      sx={{ 
        textAlign: 'center',
        padding: theme.spacing(2),
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* Add keyframes as a style element */}
      {pulsate && (
        <style>{createPulsateKeyframes(glowColor)}</style>
      )}
      {flicker && (
        <style>{createFlickerKeyframes(glowColor)}</style>
      )}
      
      <Typography
        variant="h1"
        sx={{ 
          fontFamily: 'Snowstorm, sans-serif',
          color: textColor,
          textShadow: neonTextShadow,
          animation: animationStyle,
          fontSize: fontSize,
          letterSpacing: '0.15em',
          fontWeight: 400,
          lineHeight: 1.2
        }}
      >
        {text}
      </Typography>
      
      {subText && (
        <Typography
          variant="subtitle1"
          sx={{ 
            fontFamily: 'Snowstorm, sans-serif',
            color: textColor,
            textShadow: subtitleTextShadow,
            marginTop: theme.spacing(0.5),
            opacity: 0.9,
            fontSize: subFontSize,
            letterSpacing: '0.1em',
            fontWeight: 300
          }}
        >
          {subText}
        </Typography>
      )}
    </Box>
  );
};

export default NeonTitle;