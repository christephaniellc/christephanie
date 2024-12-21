import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import React from 'react';
import { useChristephanieTheme } from '../context/ThemeContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppStateContext } from '../context/AppStateContext';
import { Link, NavLink } from 'react-router-dom';
import { appRoutes } from '../context/AppState/useRouteHistory';

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
        value={navValue}
        onChange={(event, newValue) => {
          setNavValue(newValue);
        }}
      >
        <Link to={appRoutes.Home}>
          <BottomNavigationAction
            showLabel
            value={appRoutes.Home}
            label="Home"
            icon={<HomeIcon />}
          />
        </Link>
        <Link to={appRoutes.Invitation}>
          <BottomNavigationAction showLabel value={appRoutes.Invitation} label="Invitation" icon={<ConnectWithoutContactIcon />} />
        </Link>
        <Link to={appRoutes.Profile} onClick={() => user ? () => {} : loginWithPopup()}>
          <BottomNavigationAction showLabel value={appRoutes.Profile} label="Profile" icon={<ProfileIcon />} />
        </Link>
      </BottomNavigation>
    </Box>
  );
};