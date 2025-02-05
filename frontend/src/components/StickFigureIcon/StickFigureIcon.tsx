import {
  AirlineSeatLegroomExtra,
  AirlineSeatReclineExtra,
  BabyChangingStation,
  DirectionsRun,
  DirectionsWalk,
  DownhillSkiing,
  EmojiPeople,
  FollowTheSigns,
  Hail,
  Hiking,
  Kayaking,
  Kitesurfing,
  Liquor,
  NordicWalking,
  Paragliding,
  Rowing,
  SelfImprovement,
  Skateboarding,
  Sledding,
  Snowboarding,
  Snowshoeing,
  SportsGymnastics,
  SportsHandball,
  SportsMartialArts,
} from '@mui/icons-material';
import { StickFigureIconProps } from '@/components/StickFigureIcon/types';
import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { AgeGroupEnum } from '@/types/api';

const StickFigureIcon = ({
                           fontSize = 'inherit',
                           hidden = false,
                           color,
                           error = false,
                           loading,
                           rotation,
                            ageGroup = AgeGroupEnum.Adult,
                         }: StickFigureIconProps) => {
  const StickFigureAdults = [
    DirectionsRun,
    DirectionsWalk,
    DownhillSkiing,
    FollowTheSigns,
    Kayaking,
    Kitesurfing,
    NordicWalking,
    Rowing,
    SelfImprovement,
    Paragliding,
    SportsGymnastics,
    SportsHandball,
    SportsMartialArts,
    Snowshoeing,
    Hiking,
    EmojiPeople,
    Sledding,
    Snowboarding,
    Skateboarding,
    Hail,
    Snowshoeing,
    AirlineSeatLegroomExtra,
    AirlineSeatReclineExtra,
  ];

  const [stickFigureIndex] = useState(rotation || Math.floor(Math.random() * StickFigureAdults.length));

  const RandomStickFigure = StickFigureAdults[stickFigureIndex];
  const [stickFigureRotation, setStickFigureRotation] = useState(rotation || Math.floor(Math.random() * 360));

  // We'll use a ref to store the timer ID so we can cancel it on unmount or
  // when `loading` changes.
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      // Schedule rotation updates on the exact second boundary.
      const scheduleNextRotation = () => {

        timerRef.current = window.setTimeout(() => {
          // Update rotation on the exact second
          setStickFigureRotation((prevRotation) => (prevRotation - 30) % 360);

          // Schedule the next rotation update
          scheduleNextRotation();
        }, 100);
      };

      scheduleNextRotation();
    } else {
      // If not loading, clear any scheduled timer
      if (timerRef.current) {
        clearTimeout(timerRef.current!);
      }
    }

    // Cleanup: clear timer on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current!);
      }
    };
  }, [loading]);

  return (
    <Box display={'flex'}>
      {ageGroup === AgeGroupEnum.Adult && (
        <Liquor sx={{ fontSize: 10, alignSelf: 'flex-start', opacity: hidden ? 0 : 1 }}  />
      )}
      {ageGroup !== AgeGroupEnum.Baby && <RandomStickFigure fontSize={fontSize}
                         color={error ? 'error' : color} sx={{
        // width: hidden ? 0 : 'auto',
        transform: `rotate(${stickFigureRotation}deg)`,
        transition: 'all 1s ease-in-out',
        opacity: hidden ? 0 : ageGroup === AgeGroupEnum.Under13 ? 0.2 : 1,
        // visibility: hidden ? 'hidden' : 'visible',
      }} />}
      {ageGroup === AgeGroupEnum.Baby && <BabyChangingStation fontSize={fontSize}
                                                            color={error ? 'error' : color} sx={{
        // width: hidden ? 0 : 'auto',
        transition: 'all 1s ease-in-out',
        opacity: hidden ? 0 : 1,
        // visibility: hidden ? 'hidden' : 'visible',
      }} />}
      {ageGroup === AgeGroupEnum.Under13 && (
        <RandomStickFigure fontSize='small' color={error ? 'error' : color} sx={{ alignSelf: 'flex-end', opacity: hidden ? 0 : 1 }} />
      )}
    </Box>
  );

};

export default StickFigureIcon;