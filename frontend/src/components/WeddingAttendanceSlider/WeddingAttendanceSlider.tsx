import React, { useCallback } from 'react';
import { Box, Typography, ButtonGroup, useTheme, useMediaQuery } from '@mui/material';
import StickFigureIcon from '@/components/StickFigureIcon';
import { AgeGroupEnum, RsvpEnum, InvitationResponseEnum } from '@/types/api';
import { useWeddingAttendanceSlider } from './hooks/useWeddingAttendanceSlider';
import { 
  HourglassEmpty,
  Cancel, 
  ThumbUp, 
  Celebration
} from '@mui/icons-material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsStyledTypography } from '@/components/AttendanceButton/components/StyledComponents';
import { styled } from '@mui/material/styles';
import { darken, alpha } from '@mui/system';

// Styled icon container for consistent icon styling
const IconContainer = styled(Box)(() => ({
  fontSize: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Button component specifically for wedding attendance
const WeddingAttendanceButton = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  lineHeight: 1.2,
  justifyContent: 'center',
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
}));

// Props for the attendance button component
interface AttendanceButtonProps {
  position: number;
  currentPosition: number;
  color: string;
  label: string;
  icon: React.ReactNode;
  onClick: (position: number) => void;
  isBreakpointUpMin: boolean;
  disabled: boolean;
}

// Individual attendance button component
const AttendanceButton: React.FC<AttendanceButtonProps> = ({
  position,
  currentPosition,
  color,
  label,
  icon,
  onClick,
  isBreakpointUpMin,
  disabled
}) => {
  const theme = useTheme();
  const isSelected = position === currentPosition;
  
  // Define interface for button styles
  interface ButtonStyles {
    opacity: number;
    pointerEvents: string;
    width: string;
    height: string;
    backgroundColor?: string;
    color?: string;
    border?: string;
    '&:hover'?: {
      backgroundColor: string;
    };
    textColor?: string;
    shadowColor?: string;
    textShadow?: string;
    animation?: string;
    '@keyframes pulse'?: {
      '0%': { boxShadow: string };
      '70%': { boxShadow: string };
      '100%': { boxShadow: string };
    };
  }

  // Get button styles based on position and selection state
  const getButtonStyles = (): ButtonStyles => {
    // Common styles for all buttons
    const commonStyles: ButtonStyles = {
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      width: isBreakpointUpMin ? '25%' : '100%',
      height: !isBreakpointUpMin ? '25%' : 'auto',
    };
    
    // Pending button styles (position 0)
    if (position === 0) {
      return {
        ...commonStyles,
        backgroundColor: isSelected ? alpha('#ffffff', 0.9) : 'transparent',
        color: isSelected ? theme.palette.grey[900] : theme.palette.common.white,
        border: `2px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)'}`,
        '&:hover': {
          backgroundColor: isSelected ? alpha('#ffffff', 0.8) : alpha('#ffffff', 0.1),
        },
        textColor: isSelected ? theme.palette.grey[900] : undefined,
        shadowColor: isSelected ? theme.palette.grey[400] : undefined,
        textShadow: isSelected ? `2px 2px 0 ${theme.palette.grey[400]}` : 'none',
      };
    }
    
    // Declined button styles (position 1)
    if (position === 1) {
      const errorColor = theme.palette.error.main;
      const darkErrorColor = darken(errorColor, 0.2);
      return {
        ...commonStyles,
        backgroundColor: isSelected ? errorColor : 'transparent',
        color: isSelected ? '#ffffff' : errorColor,
        border: `2px solid ${errorColor}`,
        '&:hover': {
          backgroundColor: isSelected ? darkErrorColor : alpha(errorColor, 0.1),
        },
        textColor: isSelected ? '#ffffff' : undefined,
        shadowColor: isSelected ? darkErrorColor : undefined,
        textShadow: isSelected ? `2px 2px 0 ${darkErrorColor}` : 'none',
      };
    }
    
    // Interested button styles (position 2)
    if (position === 2) {
      const blueColor = theme.palette.info.main;
      const darkBlueColor = darken(blueColor, 0.2);
      return {
        ...commonStyles,
        backgroundColor: isSelected ? blueColor : 'transparent',
        color: isSelected ? '#ffffff' : blueColor,
        border: `2px solid ${blueColor}`,
        '&:hover': {
          backgroundColor: isSelected ? darkBlueColor : alpha(blueColor, 0.1),
        },
        textColor: isSelected ? '#ffffff' : undefined,
        shadowColor: isSelected ? darkBlueColor : undefined,
        textShadow: isSelected ? `2px 2px 0 ${darkBlueColor}` : 'none',
      };
    }
    
    // Attending button styles (position 3)
    if (position === 3) {
      const goldColor = '#FFD700';
      const darkGoldColor = darken(goldColor, 0.2);
      return {
        ...commonStyles,
        backgroundColor: isSelected ? goldColor : 'transparent',
        color: isSelected ? '#000000' : goldColor,
        border: `2px solid ${goldColor}`,
        '&:hover': {
          backgroundColor: isSelected ? darkGoldColor : alpha(goldColor, 0.1),
        },
        textColor: isSelected ? '#000000' : undefined,
        shadowColor: isSelected ? darkGoldColor : undefined,
        textShadow: isSelected ? `2px 2px 0 ${darkGoldColor}` : 'none',
        animation: isSelected ? 'pulse 2s infinite' : 'none',
        '@keyframes pulse': {
          '0%': {
            boxShadow: `0 0 0 0 ${alpha(goldColor, 0.7)}`,
          },
          '70%': {
            boxShadow: `0 0 0 10px ${alpha(goldColor, 0)}`,
          },
          '100%': {
            boxShadow: `0 0 0 0 ${alpha(goldColor, 0)}`,
          },
        },
      };
    }
    
    return commonStyles;
  };

  const buttonStyles = getButtonStyles();
  
  return (
    <WeddingAttendanceButton
      sx={{
        opacity: buttonStyles.opacity,
        pointerEvents: buttonStyles.pointerEvents,
        width: buttonStyles.width,
        height: buttonStyles.height,
        backgroundColor: buttonStyles.backgroundColor,
        color: buttonStyles.color,
        border: buttonStyles.border,
        '&:hover': buttonStyles['&:hover'],
        animation: buttonStyles.animation,
        '@keyframes pulse': buttonStyles['@keyframes pulse'],
      }}
      onClick={() => onClick(position)}
    >
      <IconContainer sx={{ mb: 1 }}>
        {icon}
      </IconContainer>
      <StephsStyledTypography
        fontSize="1rem"
        useWhite={!(position === 0 && isSelected) && !(position === 3 && isSelected)}
        animate={false}
        textColor={getButtonStyles().textColor || undefined}
        shadowColor={getButtonStyles().shadowColor || undefined}
        sx={{
          lineHeight: '1.2rem',
          textShadow: getButtonStyles().textShadow || 'none',
        }}
      >
        {label}
      </StephsStyledTypography>
    </WeddingAttendanceButton>
  );
};

// Define attendance status options
const attendanceOptions = [
  { position: 0, label: 'Pending', color: 'rgba(161, 168, 194, 0.8)', icon: <HourglassEmpty fontSize="inherit" /> },
  { position: 1, label: 'Declined', color: '#f44336', icon: <Cancel fontSize="inherit" /> }, 
  { position: 2, label: 'Interested', color: '#2196f3', icon: <ThumbUp fontSize="inherit" /> }, 
  { position: 3, label: 'Attending', color: '#FFD700', icon: <Celebration fontSize="inherit" /> }, 
];

interface WeddingAttendanceSliderProps {
  guestId: string;
}

const WeddingAttendanceSlider: React.FC<WeddingAttendanceSliderProps> = ({ guestId }) => {
  const { sliderPosition, handleSliderChange, isUpdating, guest } = useWeddingAttendanceSlider(guestId);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { screenWidth } = useAppLayout();
  
  // Function to handle button click
  const handleButtonClick = useCallback((position: number) => {
    // Use a dummy event object since handleSliderChange expects an event
    const dummyEvent = new Event('click') as Event;
    handleSliderChange(dummyEvent, position);
  }, [handleSliderChange]);
  
  if (!guest) return null;
  
  const isBreakpointUpMin = screenWidth > theme.breakpoints.values.md;

  return (
    <Box
      sx={{
        width: '100%',
        mb: 3,
        pt: 1,
        position: 'relative',
      }}
      data-testid={`wedding-attendance-slider-${guestId}`}
      aria-label={`${guest.firstName}'s attendance status`}
    >
      {/* Guest name */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
          }}
        >
          {guest.firstName}'s Wedding Attendance
        </Typography>
      </Box>

      {/* Button group container */}
      <Box 
        sx={{
          width: '100%',
          p: 2,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          border: `1px solid rgba(255,255,255,0.2)`,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isBreakpointUpMin ? 'row' : 'column',
            width: '100%',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'stretch',
            minHeight: isBreakpointUpMin ? 'auto' : '300px',
          }}
        >
          {attendanceOptions.map((option) => (
            <AttendanceButton
              key={option.position}
              position={option.position}
              currentPosition={sliderPosition}
              color={option.color}
              label={option.label}
              icon={option.icon}
              onClick={handleButtonClick}
              isBreakpointUpMin={isBreakpointUpMin}
              disabled={isUpdating}
            />
          ))}
        </Box>
        
        {/* Status message */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontStyle: 'italic'
            }}
          >
            {sliderPosition === 0 && "We haven't heard if you're coming yet. Please let us know!"}
            {sliderPosition === 1 && "You've declined the invitation. You can change your answer if your plans change."}
            {sliderPosition === 2 && "You're interested in attending. Please confirm by selecting 'Attending'!"}
            {sliderPosition === 3 && "You're confirmed as attending. We're excited to see you!"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WeddingAttendanceSlider;
