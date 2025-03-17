import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { MoodBad, SentimentDissatisfied } from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Animation for the glow effect
const glowEffect = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(233, 149, 12, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(233, 149, 12, 0.8), 0 0 30px rgba(233, 149, 12, 0.5);
  }
  100% {
    box-shadow: 0 0 5px rgba(233, 149, 12, 0.5);
  }
`;

interface TalkingFaceProps {
  onToggleEmojis?: () => void;
  showEmojis?: boolean;
  tooltipTitle?: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  iconSize?: number;
}

const TalkingFaceComponent = React.forwardRef<{ animateMouth: () => void }, TalkingFaceProps>(({
  onToggleEmojis,
  showEmojis = false,
  tooltipTitle = "Emoji picker",
  color = "secondary",
  iconSize = 24
}, ref) => {
  const mouthOpenIcons = [SentimentVerySatisfiedIcon, MoodBad, SentimentDissatisfied];
  const RandomIcon = mouthOpenIcons[Math.floor(Math.random() * mouthOpenIcons.length)];
  const [showOpenMouth, setShowOpenMouth] = useState(false);
  const mouthToggleRef = useRef<number[]>([]);

  // Handle mouth animation sequences
  const animateMouth = () => {
    // Clear any existing animations
    if (mouthToggleRef.current) {
      mouthToggleRef.current.forEach(clearTimeout);
      mouthToggleRef.current = [];
    }
    
    // Create a random sequence of mouth open/close timings
    const toggleSequence = [];
    const toggleCount = 3 + Math.floor(Math.random() * 3); // 3-5 toggles
    
    for (let i = 0; i < toggleCount; i++) {
      // Random time between 50-150ms for each toggle
      const toggleTime = 50 + Math.floor(Math.random() * 100);
      
      toggleSequence.push(
        window.setTimeout(() => {
          setShowOpenMouth(prev => !prev);
        }, i * toggleTime)
      );
    }
    
    // Always end with mouth closed
    toggleSequence.push(
      window.setTimeout(() => {
        setShowOpenMouth(false);
      }, toggleCount * 100 + 50)
    );
    
    // Save the timeouts so we can clear them if needed
    mouthToggleRef.current = toggleSequence;
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (mouthToggleRef.current) {
        mouthToggleRef.current.forEach(clearTimeout);
      }
    };
  }, []);

  // Expose the animateMouth method via ref
  React.useImperativeHandle(ref, () => ({
    animateMouth
  }));

  return (
    <Tooltip title={tooltipTitle}>
      <IconButton 
        size="small" 
        color={color}
        onClick={onToggleEmojis}
        sx={{ 
          animation: showEmojis ? `${glowEffect} 2s infinite` : 'none',
          width: 40,
          height: 40,
          position: 'relative',
        }}
      >
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
        }}>
          {showOpenMouth ? (
            <RandomIcon
              color={color}
              sx={{ fontSize: iconSize }}
            />
          ) : (
            <SentimentSatisfiedAltIcon 
              color={color}
              sx={{ fontSize: iconSize }}
            />
          )}
        </Box>
      </IconButton>
    </Tooltip>
  );
});

// Display name for ESLint
TalkingFaceComponent.displayName = 'TalkingFace';

export const TalkingFace = TalkingFaceComponent;
export default TalkingFaceComponent;