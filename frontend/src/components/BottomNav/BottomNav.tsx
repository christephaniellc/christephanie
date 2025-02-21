import { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import ShieldIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import { useAuth0 } from '@auth0/auth0-react';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0Queries } from '@/hooks/useAuth0Queries';

export const BottomNav = () => {
  const [navValue, setNavValue] = useState();
  const { user: auth0User, loginWithRedirect } = useAuth0();  
  const { logOutFromAuth0 } = useAuth0Queries();  
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (isNavigating) return; // Prevent rapid clicks
    setIsNavigating(true);
    navigate(path);

    // Reset navigation lock after 500ms
    setTimeout(() => setIsNavigating(false), 500);
  };

  return (
    <Box position="fixed" bottom={0} width="100%">
      <BottomNavigation
        value={navValue}
        onChange={(event, newValue) => setNavValue(newValue)}
      >
        <BottomNavigationAction
          label="Home"
          component={Link}
          showLabel={true}
          to={routes[Pages.Welcome].path!}
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          disabled={!auth0User}
          label="Save the Date"
          component={Link}
          showLabel={true}
          to={routes[Pages.SaveTheDate].path!}
          icon={<ConnectWithoutContactIcon />}
        />
        <BottomNavigationAction
          disabled={!auth0User}
          label="Privacy Policy"
          showLabel={true}
          icon={<ShieldIcon />}
          onClick={() => handleNavigation(routes[Pages.PrivacyPolicy].path!)}
        />
        <BottomNavigationAction
          disabled={!auth0User}
          label="Terms of Service"
          showLabel={true}
          icon={<GavelIcon />}
          onClick={() => handleNavigation(routes[Pages.TermsOfService].path!)}
        />
        <BottomNavigationAction
          label={auth0User ? 'Logout' : 'Login'}
          sx={{ ml: 'auto' }}
          showLabel={true}
          icon={<ProfileIcon />}
          onClick={() => (auth0User ? logOutFromAuth0() : loginWithRedirect())}
        />
      </BottomNavigation>
    </Box>
  );
};
