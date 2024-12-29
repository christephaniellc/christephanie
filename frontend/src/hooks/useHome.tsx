import { Box } from '@mui/material';
import StickFigureIcon from '@/components/StickFigureIcon';
import React from 'react';

export const useHome = () => {
  // const { matchingUsers, familyUnit, actionNeededMessage, getFamilyQuery } = useRsvpContext();

  // useMemo(() => {
  //   if (matchingUsers) {
  //     return matchingUsers.length === 1 ? 'I' : 'We';
  //   }
  //   return undefined;
  // }, [matchingUsers]);

  const snarkyDoItSoonMessages = [
    'Sooner would be better than later',
    'We\'re waiting',
    'We\'re not getting any younger',
    'You\'re not getting any younger',
    'You\'re not going to want to do it later, either',
    'You promised you\'d do it soon',
    'Steph is kind of a planner 😐',
  ];

  // const welcomeMessage = useMemo(() => {
  //   return familyUnit ? 'Welcome to our Wedding!' : 'Are getting married!';
  // }, [familyUnit]);

  const betweenOneAndThreeStickFigures = Math.floor(Math.random() * 10) + 1;
  Array.from({ length: betweenOneAndThreeStickFigures }, (_, i) => (
    <Box key={i} width={Math.floor(Math.random() * 100)} />
));
  const randomFontSizes = ['small', 'medium', 'large'];
  const randomStickFigures = Array.from({ length: betweenOneAndThreeStickFigures }, (_, i) => (
    <>
      <StickFigureIcon fontSize={randomFontSizes[i % 2] as 'small' | 'medium' | 'large'} key={i} color={
    ['primary', 'secondary', 'error', 'info', 'success', 'warning'][i % 6] as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
} />
  <Box key={i} width={Math.floor(Math.random() * 100)} />
  </>
));

  const randomSnarkyMessage = snarkyDoItSoonMessages[Math.floor(Math.random() * snarkyDoItSoonMessages.length)];
  return {
    // welcomeMessage,
    randomStickFigures,
    // actionNeededMessage,
    randomSnarkyMessage,
    // getFamilyQuery
  };
}