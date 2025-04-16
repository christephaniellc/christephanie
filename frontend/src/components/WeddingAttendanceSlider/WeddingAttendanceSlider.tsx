import React, { useRef, useEffect, useState } from 'react';
import { Box, Slider, Typography, styled } from '@mui/material';
import StickFigureIcon from '@/components/StickFigureIcon';
import { AgeGroupEnum } from '@/types/api';
import { useWeddingAttendanceSlider } from './hooks/useWeddingAttendanceSlider';

// Custom styled slider with better visual cues
const AttendanceSlider = styled(Slider)(({ theme }) => ({
  height: 10,
  padding: '15px 0',
  cursor: 'pointer',
  // Rail (background) styling
  '& .MuiSlider-rail': {
    height: 10,
    borderRadius: 5,
    opacity: 1,
    background: 'linear-gradient(to right, rgba(161, 168, 194, 0.8), #f44336, #2196f3, #FFD700)',
  },
  // Track (colored part) styling
  '& .MuiSlider-track': {
    height: 10,
    borderRadius: 5,
    background: 'transparent', // Make track transparent to show the gradient beneath
    border: 'none',
    opacity: 0.8,
  },
  // Thumb (handle) styling
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: 'transparent', // Make thumb transparent to show our custom icon
    boxShadow: 'none',
    '&:hover': {
      boxShadow: '0 0 12px rgba(255,255,255,0.8)',
    },
    '&:focus, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: '0 0 12px #FFD700',
    },
    '&::after': {
      display: 'none', // Remove default thumb styling
    },
    '&::before': {
      display: 'none', // Remove default thumb styling
    },
  },
  // Mark styling (the dots on the slider)
  '& .MuiSlider-mark': {
    backgroundColor: '#bfbfbf',
    height: 18,
    width: 18,
    borderRadius: "50%",
    marginTop: -1,
  },
  // Target specific marks using their position in the slider
  '& .MuiSlider-mark[data-index="2"]': {
    backgroundColor: 'transparent',
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    cursor: 'pointer',
  },
  '& .MuiSlider-markActive': {
    backgroundColor: 'currentColor',
  },
  // Value label (tooltip) styling
  '& .MuiSlider-valueLabel': {

    fontSize: 14,
    fontWeight: 'bold',
    top: -12,
    backgroundColor: 'unset',
    '&:before': {
      display: 'none',
    },
    '& *': {
      background: 'transparent',
      color: '#fff',
      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
    },
  },
}));

// Styled container for the figure icon
const IconContainer = styled(Box)({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: 'none', // Allow clicks to pass through to the slider
  transition: 'transform 0.3s ease',
  zIndex: 10,
});

// Define attendance status labels and their colors
const attendanceOptions = [
  { value: 0, label: 'Pending', color: 'rgba(161, 168, 194, 0.8)' },
  { value: 1, label: 'Declined', color: '#f44336' }, // Red
  { value: 2, label: 'Interested', color: '#2196f3' }, // Blue
  { value: 3, label: 'Attending', color: '#FFD700' }, // Gold
];

interface WeddingAttendanceSliderProps {
  guestId: string;
}

const WeddingAttendanceSlider: React.FC<WeddingAttendanceSliderProps> = ({ guestId }) => {
  const { sliderPosition, handleSliderChange, isUpdating, guest, isAttending } =
    useWeddingAttendanceSlider(guestId);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [iconPosition, setIconPosition] = useState({ left: 0, top: 0 });
  const [sliderWidth, setSliderWidth] = useState(0);

  // Update icon position based on slider position
  useEffect(() => {
    if (sliderRef.current) {
      const sliderRect = sliderRef.current.getBoundingClientRect();
      const width = sliderRect.width;
      setSliderWidth(width);

      // Calculate position as percentage of slider width
      // For a slider with min=0, max=3
      const positionPercent = sliderPosition / 3;

      // Calculate left position (adjust for padding)
      const thumbLeft = width * positionPercent;

      setIconPosition({
        left: thumbLeft,
        top: 5, // Position just above the slider
      });
    }
  }, [sliderPosition, sliderRef.current]);

  if (!guest) return null;

  // Create direct array of marks for the slider
  const marks = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Declined', style: { opacity: 0, display: 'none' } }, // Hidden mark
    { value: 2, label: 'Interested' },
    { value: 3, label: 'Attending' }
  ];

  // Get current status info
  const currentStatus = attendanceOptions[sliderPosition];

  const handleChangeWithLogging = (event: Event, newValue: number | number[]) => {
    console.log('Slider onChange event triggered', {
      event,
      newValue,
      guestId,
      previousPosition: sliderPosition,
    });
    handleSliderChange(event, newValue);
  };

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
      {/* Guest name and current status */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          {guest.firstName}
        </Typography>
        {/*<Typography*/}
        {/*  variant="body2"*/}
        {/*  sx={{*/}
        {/*    fontWeight: 'bold',*/}
        {/*    color: currentStatus.color,*/}
        {/*    backgroundColor: 'rgba(0,0,0,0.3)',*/}
        {/*    px: 1,*/}
        {/*    py: 0.5,*/}
        {/*    borderRadius: 1,*/}
        {/*  }}*/}
        {/*>*/}
        {/*  {currentStatus.label}*/}
        {/*</Typography>*/}
      </Box>

      {/* Slider container with positioned icon */}
      <Box sx={{ position: 'relative', height: 60, mt: 4 }}>
        {/* The icon that follows the thumb */}
        <IconContainer
          sx={{
            left: `${iconPosition.left}px`,
            top: `-20px`,
            transform: `translateX(-50%)`,
            color: currentStatus.color,
            filter: isAttending
              ? `drop-shadow(0px 0px 6px ${currentStatus.color}) drop-shadow(0px 2px 4px rgba(0,0,0,0.5))`
              : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
          }}
        >
          <StickFigureIcon
            fontSize="medium"
            ageGroup={guest.ageGroup || AgeGroupEnum.Adult}
            rotation={0}
            color={currentStatus.color}
          />
        </IconContainer>

        {/* The interactive slider */}
        <Box
          ref={sliderRef}
          sx={{
            cursor: isUpdating ? 'wait' : 'pointer',
            opacity: isUpdating ? 0.7 : 1,
            transition: 'opacity 0.3s ease',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            '&:hover': {
              opacity: isUpdating ? 0.7 : 0.9,
            },
          }}
        >
          <AttendanceSlider
            value={sliderPosition}
            step={1}
            min={0}
            max={3}
            marks={marks.map((mark) => ({
              value: mark.value,
              label: '',
              style: mark.style || {} // Apply custom style if available
            }))}
            onChangeCommitted={handleChangeWithLogging}
            disabled={isUpdating}


            valueLabelDisplay="off"
            // valueLabelFormat={(value) => attendanceOptions[value].label}
            aria-label={`Set ${guest.firstName}'s attendance status`}
            aria-valuetext={currentStatus.label}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default WeddingAttendanceSlider;
