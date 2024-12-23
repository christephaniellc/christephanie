import {
  Box,
  CssBaseline,
  Stack, Typography, useTheme,
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import React, { useEffect, useMemo } from 'react';
import { BottomNav } from './components/BottomNav';
import { DaysUntil } from './components/DaysUntil';
import { useChristephanieTheme } from './context/Providers/AppState/ThemeContext';
import { useAppStateContext } from './context/Providers/AppState/AppStateContext';
import { useRsvpContext } from './context/Providers/AppState/Wedding/Rsvp/RsvpContext';
import ElPulpoHead from './assets/el_pulpo_cabeza.jpg';
import ElPulpoWide from './assets/el_pulpo_andy.jpg';
import Elephant from './assets/elephant.jpg';

export const Layout = () => {
  const { appLayout } = useAppStateContext();
  const { contentHeight } = appLayout;
  const { familyUnit } = useRsvpContext();
  const { navValue, currentRoute } = useAppStateContext();

  const backgroundImgSrc = useMemo(() => {
    switch (navValue) {
      case '/invitation':
        return appLayout.screenWidth > 600 ? ElPulpoWide : ElPulpoHead;
      default:
        return Elephant;
    }
  }, [navValue, currentRoute, appLayout.screenWidth]);

  return (
    <CssBaseline>
      <Stack
        id={'layout'}
        sx={{
          height: contentHeight,
          bgcolor: 'background.default',
        }}>
        <Box id='content'>
          <Box textAlign="center" flexWrap="wrap" border="0px solid green" flexGrow={1} display="flex"
               justifyContent="center">
            <Typography variant="h4" color="text.primary" gutterBottom mt={4} width="100%">
              Steph & Topher
            </Typography>
            {familyUnit && <DaysUntil event="Wedding" interested={'Pending'} />}
          </Box>
          <Outlet />
        </Box>
        <Box id='background' position='relative'>
            {currentRoute}
        </Box>
      </Stack>
      <BottomNav />
    </CssBaseline>
  );
};