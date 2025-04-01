import { useEffect, useMemo, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box, useTheme, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import GavelIcon from '@mui/icons-material/Gavel';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import PrintIcon from '@mui/icons-material/Print';
import BarChartIcon from '@mui/icons-material/BarChart';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import GiftCardIcon from '@mui/icons-material/CardGiftcard';
import { useAuth0 } from '@auth0/auth0-react';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0Queries } from '@/hooks/useAuth0Queries';
import Paper from '@mui/material/Paper';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { isAdmin } from '@/utils/roles';
import AppVersionFooter from '../VersionHash';
import { isFeatureEnabled } from '@/config';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: auth0User, loginWithRedirect } = useAuth0();  
  const { logOutFromAuth0 } = useAuth0Queries();  
  const currentUser = useRecoilValue(userState);
  const userIsAdmin = isAdmin(currentUser);

  // Determine which tab should be active based on the current location
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === routes[Pages.Welcome].path) return 0;
    if (path === routes[Pages.SaveTheDate].path) return 1;
    if (path === routes[Pages.RSVP].path) return 2;
    if (path === routes[Pages.Details].path) return 3;
    if (path === routes[Pages.Registry].path) return 4;
    if (path === routes[Pages.Bureaucracy].path) return 5;
    if (path === routes[Pages.Stats].path) return 6;
    if (path === routes[Pages.Admin].path) return 7;
    if (path === routes[Pages.PrintedRsvp].path) return 8;
    return -1; // No tab selected
  };
  
  const [activeTab, setActiveTab] = useState(getCurrentTab());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getCurrentTab());
  }, [location.pathname]);
  
  // Handle tab change
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0: 
        navigate(routes[Pages.Welcome].path!);
        break;
      case 1:
        navigate(routes[Pages.SaveTheDate].path!);
        break;
      case 2:
        navigate(routes[Pages.RSVP].path!);
        break;
      case 3:
        navigate(routes[Pages.Details].path!);
        break;
      case 4:
        navigate(routes[Pages.Registry].path!);
        break;
      case 5:
        navigate(routes[Pages.Bureaucracy].path!);
        break;
      case 6:
        navigate(routes[Pages.Stats].path!);
        break;
      case 7:
        navigate(routes[Pages.Admin].path!);
        break;
      case 8:
        navigate(routes[Pages.PrintedRsvp].path!);
        break;
      case 9: // Auth button
        if (auth0User) {
          logOutFromAuth0();
        } else {
          localStorage.removeItem('user');
          loginWithRedirect({
            authorizationParams: {
              prompt: 'login',
              screen_hint: 'login',
              redirect_uri: window.location.origin,
            }
          });
        }
        break;
    }
  };

  return (
    <Box>
      {/* AppVersionFooter positioned above the BottomNav */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: '65px',  // Position right above the BottomNav height
          width: '100%',
          zIndex: 999,     // Just below BottomNav zIndex
          padding: '0px 8px 2px 0px',  // Slight adjustment to padding
          background: 'transparent',
          display: 'flex',
          justifyContent: 'flex-end' // Ensure alignment to right side
        }}
      >
        <AppVersionFooter />
      </Box>
      
      <Box 
        position="fixed" 
        bottom={0} 
        width="100%" 
        sx={{ backgroundColor: 'transparent', zIndex: 1000, height: 65, borderRadius: 0 }} 
        component={Paper} 
        elevation={5}
        role="navigation"
        aria-label="Main navigation"
      >
        <BottomNavigation
          sx={{ 
            backgroundColor: 'rgba(0,0,0,.7)', 
            backdropFilter: 'blur(20px)', 
            borderTop: '4px solid rgba(255,255,255,.1)', 
            height: 65,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.3)',
            borderRadius: 0,
            "& .MuiBottomNavigationAction-root.Mui-selected": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
            },
            "& .MuiBottomNavigationAction-root": {
              minWidth: '42px',
              padding: '0 0',
              fontSize: '0.6rem',
              '@media (min-width: 400px)': {
                minWidth: '56px',
                padding: '0 1px'
              },
              '@media (min-width: 600px)': {
                minWidth: '65px',
                padding: '0 2px'
              }
            }
          }}
          value={activeTab}
          onChange={handleChange}
          showLabels
        >
          {/* Home */}
          <BottomNavigationAction
            label="Home"
            icon={<HomeIcon />}
            aria-label="Go to home page"
            disabled={false}
          />
          
          {/* Survey (only for authenticated users) */}
          <BottomNavigationAction
            label="Survey"
            icon={<ConnectWithoutContactIcon />}
            aria-label="Go to Save the Date Survey page"
            disabled={!auth0User}
          />

          {/* RSVP (only for authenticated users) */}
          <BottomNavigationAction
            label="RSVP"
            icon={<SaveAsIcon />}
            aria-label="Go to RSVP pages"
            disabled={!auth0User}
            sx={{ display: isFeatureEnabled('ENABLE_RSVP')  ? 'flex' : 'none' }}
          />

          {/* Info (only for authenticated users) */}
          <BottomNavigationAction
            label="Details"
            icon={<AutoAwesomeIcon />}
            aria-label="Go to detail pages"
            disabled={!auth0User}
            sx={{ display: isFeatureEnabled('ENABLE_DETAILS')  ? 'flex' : 'none' }}
          />

          {/* Registry (only for authenticated users) */}
          <BottomNavigationAction
            label="Registry"
            icon={<GiftCardIcon />}
            aria-label="Go to registry page"
            disabled={!auth0User}
            sx={{ display: isFeatureEnabled('ENABLE_REGISTRY')  ? 'flex' : 'none' }}
          />
          
          {/* Bureaucracy */}
          <BottomNavigationAction
            label="Bureaucracy"
            icon={<GavelIcon />}
            aria-label="View legal information and bureaucracy pages"
            disabled={false}
          />
          
          {/* Stats (only for authenticated users) */}
          <BottomNavigationAction
            label="Stats"
            icon={<BarChartIcon />}
            aria-label="View wedding statistics"
            disabled={!auth0User}
          />

          {/* Admin Updates (only for admin users) */}
          <BottomNavigationAction
            label="Admin"
            icon={<AutoFixHighIcon />}
            aria-label="Update Users"
            disabled={!userIsAdmin}
            sx={{ display: userIsAdmin ? 'flex' : 'none' }}
          />
          
          {/* Printed RSVP (only for admin users) */}
          <BottomNavigationAction
            label="Printed RSVP"
            icon={<PrintIcon />}
            aria-label="View Printed RSVP"
            disabled={!userIsAdmin}
            sx={{ display: userIsAdmin ? 'flex' : 'none' }}
          />
          
          {/* Login/Logout button */}
          <BottomNavigationAction
            label={auth0User ? 'Logout' : 'Login'}
            icon={<ProfileIcon color={auth0User ? 'inherit' : 'secondary'} />}
            aria-label={auth0User ? 'Log out of your account' : 'Log in to your account'}
          />
        </BottomNavigation>
      </Box>
    </Box>
  );
};