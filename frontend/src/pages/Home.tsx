import {
  Box, Button, Typography,

} from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { useChristephanieTheme } from '../context/ThemeContext';
import React, { useMemo } from 'react';
import { useRsvpContext } from '../context/Rsvp/RsvpContext';
import { useAppStateContext } from '../context/AppStateContext';
import StickFigureIcon from '../components/StickFigureIcon';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { RsvpCodeTextInput } from '../components/RsvpCodeTextInput';

export const useHome = () => {
  const { matchingUsers, familyUnit, actionNeededMessage, getFamilyQuery } = useRsvpContext();

  useMemo(() => {
    if (matchingUsers) {
      return matchingUsers.length === 1 ? 'I' : 'We';
    }
    return undefined;
  }, [matchingUsers]);

  const snarkyDoItSoonMessages = [
    'Sooner would be better than later',
    'We\'re waiting',
    'We\'re not getting any younger',
    'You\'re not getting any younger',
    'You\'re not going to want to do it later, either',
    'You promised you\'d do it soon',
    'Steph is kind of a planner 😐',
  ];

  const welcomeMessage = useMemo(() => {
    return familyUnit ? 'Welcome to our Wedding!' : 'Are getting married!';
  }, [familyUnit]);

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
    welcomeMessage,
    randomStickFigures,
    actionNeededMessage,
    randomSnarkyMessage,
    getFamilyQuery
  };
}
export const Home = () => {
  const { welcomeMessage, randomStickFigures, getFamilyQuery, actionNeededMessage, randomSnarkyMessage } = useHome();
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" height="100%" justifyContent="flex-start" alignItems="flex-center"
         textAlign="center">
      <Typography variant="h2" color="text.primary" gutterBottom mt={4}>
        {welcomeMessage}
      </Typography>
      {!getFamilyQuery.data && (
        <>
          <Typography variant="h4" color="text.primary" gutterBottom mt={4}>
            Please enter your invitation code to get started.
          </Typography>
          <Box maxWidth={300} mx="auto" mb={2}>
            <RsvpCodeTextInput />
          </Box>
        </>
      )}
      {getFamilyQuery.data &&
        <>
          <Button
            onClick={() => navigate('/invitation')}
            sx={{
              border: '4px solid white',
              padding: 4,
              margin: 4,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} flexWrap="wrap">
              {randomStickFigures.map((stickFigure, i) => (
                <React.Fragment key={i}>
                  {stickFigure}
                </React.Fragment>
              ))}
            </Box>
            <Box>
              <Typography variant="h4" color="text.primary" gutterBottom mt={4} width="100%">
                {actionNeededMessage}
              </Typography>
              <Typography variant="h5" color="text.primary" gutterBottom mt={4} width="100%">
                {randomSnarkyMessage}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent='center'>
                <Typography variant="caption" color="text.primary">
                  (Click to get it done).
                </Typography>

                <KeyboardDoubleArrowRightIcon fontSize={'large'} />
              </Box>
            </Box>
          </Button>
        </>
      }
    </Box>
  );
};

styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  mx: 'auto',
  [theme.breakpoints.up('sm')]: {
    mx: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 800,
    mb: 4,
  },
}));
