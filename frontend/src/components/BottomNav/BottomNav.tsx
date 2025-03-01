import { useEffect, useMemo, useState } from 'react';
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
import Paper from '@mui/material/Paper';
import { useFamily } from '@/store/family';
import { useRecoilValue } from 'recoil';
import { stdStepperState } from '@/store/steppers/steppers';

export const BottomNav = () => {
  const [navValue, setNavValue] = useState();
  const { user: auth0User, loginWithRedirect } = useAuth0();  
  const { logOutFromAuth0 } = useAuth0Queries();  
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const stdStepper = useRecoilValue(stdStepperState);

  const handleNavigation = (path: string) => {
    if (isNavigating) return; // Prevent rapid clicks
    setIsNavigating(true);
    navigate(path);

    // Reset navigation lock after 500ms
    setTimeout(() => setIsNavigating(false), 500);
  };

  const activeLegalButtons = useMemo(() => {
    return stdStepper.currentStep[0] === 'communicationPreference' || stdStepper.currentStep[0] === 'mailingAddress' ? 'secondary' : 'inherit' as 'secondary' | 'inherit'
  }, [stdStepper.currentStep]);

  useEffect(() => {
    console.log(stdStepper.currentStep[0])
  }, [stdStepper.currentStep]);

  return (
    <Box position="fixed" bottom={0} width="100%" sx={{ backgroundColor: 'transparent', zIndex: 100, height: 65}} component={Paper} elevation={5}>
      <BottomNavigation
        sx={{ backgroundColor: 'rgba(0,0,0,.5)', backdropFilter: 'blur(20px)', borderTop: '4px solid rgba(255,255,255,.1)', height: 65 }}
        value={navValue}
        onChange={(event, newValue) => setNavValue(newValue)}
      >
        <BottomNavigationAction
          label="Home"
          component={Link}
          sx={{ lineHeight: 1}}
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
          color={activeLegalButtons}
          sx={{ height: '100%', marginLeft: 'auto', backgroundColor: 'rgba(255, 255, 255, .1)' }}
          label="Privacy Policy"
          showLabel={true}
          icon={<ShieldIcon color={activeLegalButtons} />}
          onClick={() => handleNavigation(routes[Pages.PrivacyPolicy].path!)}
        />
        <BottomNavigationAction
          color={activeLegalButtons}
          sx={{ height: '100%', marginRight: 'auto', backgroundColor: 'rgba(255, 255, 255, .1)' }}
          label="Terms of Service"
          showLabel={true}
          icon={<GavelIcon color={activeLegalButtons} />}
          onClick={() => handleNavigation(routes[Pages.TermsOfService].path!)}
        />
        <BottomNavigationAction
          label={auth0User ? 'Logout' : 'Login'}
          showLabel={true}
          icon={<ProfileIcon />}
          onClick={() => (auth0User ? logOutFromAuth0() : loginWithRedirect())}
        />
      </BottomNavigation>
    </Box>
  );
};
