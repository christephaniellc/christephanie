import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppStateContext } from '@/context/Providers/AppState/AppStateContext';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import ThemeIcon from '@mui/icons-material/InvertColors';
import useTheme from '@/store/theme';
import { Themes } from '@/theme/types';
import { Link } from 'react-router-dom';

export const BottomNav = () => {
  // const { navValue, setNavValue } = useAppStateContext();
  const [navValue, setNavValue] = useState();
  const { user, loginWithPopup, logout  } = useAuth0();

  const [themes, themeActions] = useTheme();

  return (
    <Box position="fixed" bottom={0} width="100%">
      <BottomNavigation
        value={navValue}
        onChange={(event, newValue) => {
          setNavValue(newValue);
        }}
      >
        <BottomNavigationAction // Routes
          label="Home"
          component={Link}
          showLabel={true}
          to={routes[Pages.Welcome].path!}
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          disabled={!user}
          label="Save the Date"
          component={Link}
          showLabel={true}
          to={routes[Pages.SaveTheDate].path!}
          icon={<ConnectWithoutContactIcon />}
        />

        <BottomNavigationAction // Actions
          label={user ? 'Logout' : 'Login'}
          sx={{ ml: 'auto' }}
          showLabel={true}
          icon={<ProfileIcon />}
          onClick={() => {
            user ? logout() : loginWithPopup({ state: JSON.stringify({guest_id: guest?.guestId })});
          }}
        />
        <BottomNavigationAction
          showLabel={true}
          icon={<ThemeIcon />}
          label={themes === Themes.DARK ? 'Light' : 'Dark'}
          onClick={() => themeActions.toggle()}
        />
      </BottomNavigation>
    </Box>
  );
};