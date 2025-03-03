import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import Box from '@mui/material/Box';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { saveTheDateStepsState, stdTabIndex } from '@/store/steppers/steppers';
import { useRecoilValue } from 'recoil';
import { useFamily } from '@/store/family';
import { useApiContext } from '@/context/ApiContext';

const digitalTitieRotations = [15, 33, 40, 22, 65, 13, 80, 88];

const MtvAnimatedTitle = () => {
  const loading = useRef(false);
  const {
    findUserIdQuery,
    getMeQuery,
    validateAddressMutation,
    getFamilyUnitQuery,
    patchFamilyMutation,
    patchFamilyGuestMutation,
  } = useApiContext();

  useEffect(() => {
    loading.current =
      findUserIdQuery.isFetching ||
      getMeQuery.isFetching ||
      getFamilyUnitQuery.isFetching ||
      !patchFamilyMutation.isIdle ||
      !patchFamilyGuestMutation.isIdle ||
      !validateAddressMutation.isIdle;
  }, [
    findUserIdQuery.isFetching,
    getMeQuery.isFetching,
    getFamilyUnitQuery.isFetching,
    patchFamilyMutation.isIdle,
    patchFamilyGuestMutation.isIdle,
    validateAddressMutation.isPending,
  ]);
  const theme = useTheme();
  const { boxShadow } = useBoxShadow();
  const saveTheDateSteps = useRecoilValue(saveTheDateStepsState);
  const tabIndex = useRecoilValue(stdTabIndex);

  // State to hold the current rotation value.
  const [rotationX, setRotationX] = useState(15);

  useEffect(() => {
    let isCancelled = false;
    const timeouts = [];
    const cycleDuration = 170; // shorter cycle for faster flicker

    const animateTitle = () => {
      if (!loading.current) return;

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
      let sequence = [startValue];
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

    if (loading.current) {
      animateTitle();
    } else {
      // When not loading, ensure the rotation resets to 0.
      setRotationX(0);
    }

    return () => {
      isCancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [loading.current, rotationX, getMeQuery.isFetching, findUserIdQuery.isFetching, getFamilyUnitQuery.isFetching, patchFamilyMutation.isIdle, patchFamilyGuestMutation.isIdle, validateAddressMutation.isPending]);

  return (
    <Box p={2} height={110} display="flex" alignItems="center" width={1}>
      <StephsActualFavoriteTypography
        variant="h6"
        sx={{
          ml: 'auto',
          mr: 'auto',
          mb: 2,
          width: 'fit-content',
          color: 'palette.secondary',
          transform: `rotateX(${rotationX}deg)`,
          [theme.breakpoints.up('md')]: {
            pl: '200px',
          },
          filter: `drop-shadow(${boxShadow})`,
        }}
      >
        {Object.values(saveTheDateSteps)[tabIndex]?.label}
      </StephsActualFavoriteTypography>
    </Box>
  );
};

export default MtvAnimatedTitle;
