import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import React from 'react';
import { useChristephanieTheme } from '../context/ThemeContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppStateContext } from '../context/AppStateContext';

export const BottomNav = () => {
  const { mode, toggleTheme, mixedBackgroundSx } = useChristephanieTheme();
  const { navValue, setNavValue } = useAppStateContext();
  const { user, loginWithPopup } = useAuth0();

  return (
    <Box position="fixed" bottom={0} width="100%">
      <BottomNavigation
        sx={{
          ...mixedBackgroundSx,
        }}
        showLabels
        value={navValue}
        onChange={(event, newValue) => {
          setNavValue(newValue);
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        {user && (<></>)}
      </BottomNavigation>
    </Box>
  );
};