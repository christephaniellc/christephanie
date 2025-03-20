// MtvAnimatedTitle.jsx
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import Box from '@mui/material/Box';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { saveTheDateStepsState, stdTabIndex } from '@/store/steppers/steppers';
import { useRecoilValue } from 'recoil';
import { useApiContext } from '@/context/ApiContext';
import TvSnow from './TvSnow';
import { rem } from 'polished';

const digitalTitieRotations = [15, 33, 40, 22, 65, 13, 80, 88];

const MtvAnimatedTitle = () => {
  const {
    findUserIdQuery,
    getMeQuery,
    validateAddressMutation,
    getFamilyUnitQuery,
    patchFamilyMutation,
    patchFamilyGuestMutation,
  } = useApiContext();

  // Compute a loading flag from our API queries/mutations.
  const isLoading =
    findUserIdQuery.isFetching ||
    getMeQuery.isFetching ||
    getFamilyUnitQuery.isFetching ||
    patchFamilyMutation.isPending ||
    patchFamilyGuestMutation.isPending ||
    validateAddressMutation.isPending;

  const theme = useTheme();
  const { boxShadow } = useBoxShadow();
  const saveTheDateSteps = useRecoilValue(saveTheDateStepsState);
  const tabIndex = useRecoilValue(stdTabIndex);

  // State to hold the current rotation value.
  const [rotationX, setRotationX] = useState(15);
  // State for controlling the flashing TV snow
  const [showSnow, setShowSnow] = useState(false);

  // Effect for animating the title’s rotation
  useEffect(() => {
    let isCancelled = false;
    const timeouts = [];
    const cycleDuration = 170; // shorter cycle for faster flicker

    const animateTitle = () => {
      if (!isLoading) return;

      // Determine the starting rotation value.
      const currentValue = rotationX;
      const currentIndex = digitalTitieRotations.indexOf(currentValue);
      const startValue = currentIndex === -1 ? digitalTitieRotations[0] : currentValue;

      // Choose an end value that is not "adjacent" (by index) to the current value.
      const candidateIndices = digitalTitieRotations
        .map((_, idx) => idx)
        .filter((idx) => currentIndex === -1 || Math.abs(idx - currentIndex) > 1);
      const endIndex =
        candidateIndices.length > 0
          ? candidateIndices[Math.floor(Math.random() * candidateIndices.length)]
          : Math.floor(Math.random() * digitalTitieRotations.length);
      const endValue = digitalTitieRotations[endIndex];

      // Randomly pick between 2 and 8 steps for this cycle.
      const steps = Math.floor(Math.random() * (digitalTitieRotations.length - 1)) + 2;
      const delay = cycleDuration / steps;

      // Build a sequence of rotation values starting with startValue and ending with endValue.
      const sequence = [startValue];
      for (let i = 1; i < steps - 1; i++) {
        let randomVal;
        do {
          randomVal =
            digitalTitieRotations[Math.floor(Math.random() * digitalTitieRotations.length)];
        } while (randomVal === sequence[i - 1]);
        sequence.push(randomVal);
      }
      sequence.push(endValue);

      // Schedule each step in the sequence.
      sequence.forEach((val, i) => {
        const timeout = setTimeout(() => {
          if (!isCancelled) {
            setRotationX(val);
          }
        }, i * delay);
        timeouts.push(timeout);
      });

      // Schedule the next cycle.
      const nextCycle = setTimeout(() => {
        animateTitle();
      }, cycleDuration);
      timeouts.push(nextCycle);
    };

    if (isLoading) {
      animateTitle();
    } else {
      // When not loading, ensure the rotation resets.
      setRotationX(0);
    }

    return () => {
      isCancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [
    isLoading,
    rotationX,
    getMeQuery.isFetching,
    findUserIdQuery.isFetching,
    getFamilyUnitQuery.isFetching,
    patchFamilyMutation.isIdle,
    patchFamilyGuestMutation.isIdle,
    validateAddressMutation.isPending,
  ]);

  // Effect for flashing the TV snow while loading.
  useEffect(() => {
    let snowTimer;
    if (isLoading) {
      const flashSnow = () => {
        setShowSnow(true);
        // Hide snow after a short flash duration (e.g., 50ms)
        setTimeout(() => {
          setShowSnow(false);
        }, 50);
        // Schedule the next flash at a random interval (e.g., between 100ms and 300ms)
        const nextInterval = Math.floor(Math.random() * 200) + 100;
        snowTimer = setTimeout(flashSnow, nextInterval);
      };
      flashSnow();
    } else {
      setShowSnow(false);
    }
    return () => {
      clearTimeout(snowTimer);
    };
  }, [isLoading]);

  // Compute the scaleX factor: a linear mapping from rotation 0-90 to scale 1-1.3.
  const scaleX = 1 + (rotationX / 90) * 0.3;

  // Check if the current step is the "Interested" step
  const isInterestedStep = Object.values(saveTheDateSteps)[tabIndex]?.label === "Interested";
  
  return (
    <Box p={2} height={80} display="flex" alignItems="center" width={1} position="relative">
      {/* Arrow pointing to typography for the "Interested" step */}
      {isInterestedStep && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 20,
            transform: 'translateY(-50%)',
            animation: 'bounce 1.5s infinite ease-in-out',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateX(0) translateY(-50%)' },
              '50%': { transform: 'translateX(10px) translateY(-50%)' },
            },
            color: theme.palette.secondary.main,
            zIndex: 10,
            display: { xs: 'none', md: 'block' } // Only show on medium screens and up
          }}
        >
          <Box sx={{ position: 'relative', width: 60, height: 40 }}>
            <Box 
              component="div" 
              sx={{ 
                position: 'absolute',
                width: 35,
                height: 3,
                backgroundColor: 'currentColor',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)'
              }}
            />
            <Box 
              component="div"
              sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: `15px solid ${theme.palette.secondary.main}`,
                top: '50%',
                right: 10,
                transform: 'translateY(-50%)'
              }}
            />
          </Box>
        </Box>
      )}
      
      <StephsActualFavoriteTypography
        variant="h6"
        sx={{
          ml: 'auto',
          mr: 'auto',
          mb: 2,
          fontStretch: 'expanded',
          // width: ,
          color: isInterestedStep ? theme.palette.secondary.main : 'palette.secondary',
          // Combine rotateX and scaleX transforms
          transform: `rotateX(${rotationX}deg) scaleX(${scaleX})`,
          // [theme.breakpoints.up('md')]: {
          //   pl: '200px',
          // },
          filter: `drop-shadow(${boxShadow})`,
          lineHeight: '24px',
          fontSize: { xs: rem(16), sm: rem(18), md: rem(20), lg: rem(22), xl: rem(24) },
        }}
      >
        {Object.values(saveTheDateSteps)[tabIndex]?.label}
      </StephsActualFavoriteTypography>
      
      {/* Arrow pointing from the right side on small screens */}
      {isInterestedStep && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: 20,
            transform: 'translateY(-50%) scaleX(-1)', // Flip arrow to point from right
            animation: 'bounce 1.5s infinite ease-in-out',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateX(0) translateY(-50%) scaleX(-1)' },
              '50%': { transform: 'translateX(-10px) translateY(-50%) scaleX(-1)' },
            },
            color: theme.palette.secondary.main,
            zIndex: 10,
            display: { xs: 'block', md: 'none' } // Only show on small screens
          }}
        >
          <Box sx={{ position: 'relative', width: 60, height: 40 }}>
            <Box 
              component="div" 
              sx={{ 
                position: 'absolute',
                width: 35,
                height: 3,
                backgroundColor: 'currentColor',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)'
              }}
            />
            <Box 
              component="div"
              sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: `15px solid ${theme.palette.secondary.main}`,
                top: '50%',
                right: 10,
                transform: 'translateY(-50%)'
              }}
            />
          </Box>
        </Box>
      )}
      
      {showSnow && <TvSnow />}
    </Box>
  );
};

export default MtvAnimatedTitle;
