import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { useAppStateContext } from '@/context/Providers/AppState/AppStateContext';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import ThemeIcon from '@mui/icons-material/InvertColors';
import IconButton from '@mui/material/IconButton';
import useTheme from '@/store/theme';

export const BottomNav = () => {
  const { navValue, setNavValue } = useAppStateContext();
  const { user, loginWithPopup } = useAuth0();
  const [_, themeActions] = useTheme();

  return (
    <Box position="fixed" bottom={0} width="100%">
      <BottomNavigation
        sx={{ pt: 1 }}
        value={navValue}
        onChange={(event, newValue) => {
          setNavValue(newValue);
        }}
      >
        <Link to={routes[Pages.Welcome].path!}>
          <BottomNavigationAction
            showLabel={true}
            value={routes[Pages.Welcome].path!}
            label="Home"
            icon={<HomeIcon />}
          />
        </Link>
        <Link to={routes[Pages.SaveTheDate].path!}>
          <BottomNavigationAction showLabel={true} value={routes[Pages.SaveTheDate].path!} label="Invitation" icon={<ConnectWithoutContactIcon />} />
        </Link>
        <Link to={routes[Pages.Profile].path!} onClick={() => user ? () => {} : loginWithPopup()}>
          <BottomNavigationAction showLabel={true} value={routes[Pages.Profile].path!} label="Profile" icon={<ProfileIcon />} />
        </Link>
        <IconButton
          color="info"
          edge="end"
          size="large"
          onClick={themeActions.toggle}
          data-pw="theme-toggle"
          sx={{ pt: 1, ml: 'auto', mr: 1}}
        >
          <ThemeIcon />
        </IconButton>
      </BottomNavigation>

    </Box>
  );
};