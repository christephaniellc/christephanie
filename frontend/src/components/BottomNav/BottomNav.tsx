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
import { detailsRoutes } from '@/routes/details-routes';
import { useVisitedPages } from '@/hooks/useVisitedPages';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: auth0User, loginWithRedirect } = useAuth0();
  const { logOutFromAuth0 } = useAuth0Queries();
  const currentUser = useRecoilValue(userState);
  const userIsAdmin = isAdmin(currentUser);
  
  // Use our custom hook to track visited pages
  const { visitedPages, markVisited, refreshVisitedPagesFromStorage } = useVisitedPages();
  
  // Refresh visited pages when auth0User changes
  useEffect(() => {
    // We'll refresh regardless of whether the user is logged in or not,
    // since we're using a global storage key now
    setTimeout(() => {
      refreshVisitedPagesFromStorage();
    }, 100);
  }, [auth0User, refreshVisitedPagesFromStorage]);

  // Determine which tab should be active based on the current location
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === routes[Pages.Welcome].path) return 0;
    if (path === routes[Pages.SaveTheDate].path) return 1;
    if (path === routes[Pages.RSVP].path) return 2;
    if (path === routes[Pages.Details].path) return 3;
    if (path === routes[Pages.Registry].path) return 4;
    if (path === routes[Pages.Stats].path) return 5;
    if (path === routes[Pages.Bureaucracy].path) return 6;
    
    // Highlight Admin tab for any path that starts with /admin
    if (path.startsWith('/admin')) return 7;
    
    //if (path === routes[Pages.PrintedRsvp].path) return 8;
    return -1; // No tab selected
  };

  const [activeTab, setActiveTab] = useState(getCurrentTab());

  // Update active tab when location changes and mark pages as visited
  useEffect(() => {
    setActiveTab(getCurrentTab());
    
    // Only track page visits if the user is authenticated
    if (auth0User) {
      // Mark the current page as visited based on the path
      const currentPath = location.pathname;
      
      // Handle details pages (both main details page and subpages)
      if (currentPath === routes[Pages.Details].path || 
          Object.values(detailsRoutes).some(route => currentPath === route.path)) {
        markVisited('details');
      }
      
      // Handle registry page
      if (currentPath === routes[Pages.Registry].path) {
        markVisited('registry');
      }

      // Handle stats page
      if (currentPath === routes[Pages.Stats].path) {
        markVisited('stats');
      }

      // Handle RSVP page
      if (currentPath === routes[Pages.RSVP].path) {
        markVisited('rsvp');
      }
    }
  }, [location.pathname, markVisited, auth0User]);

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
        markVisited('rsvp');
        break;
      case 3:
        navigate(routes[Pages.Details].path!);
        markVisited('details');
        break;
      case 4:
        navigate(routes[Pages.Registry].path!);
        markVisited('registry');
        break;
      case 5:
          navigate(routes[Pages.Stats].path!);
          markVisited('stats');
          break;
      case 6:
        navigate(routes[Pages.Bureaucracy].path!);
        break;
      case 7:
        navigate(routes[Pages.Admin].path!);
        break;
      // case 8:
      //   navigate(routes[Pages.PrintedRsvp].path!);
      //   break;
      case 8: // Auth button
        if (auth0User) {
          logOutFromAuth0();
        } else {
          // Clear any existing auth flags first
          sessionStorage.removeItem('auth_in_progress');
          sessionStorage.removeItem('auth_completed_time');
          
          // Set fresh auth flag to prevent service worker conflicts
          sessionStorage.setItem('auth_in_progress', 'true');
          
          // Force fresh authentication to ensure we get to Auth0 login page
          loginWithRedirect({
            authorizationParams: {
              redirect_uri: window.location.origin,
              prompt: 'login', // Force Auth0 to show login page
            },
            appState: {
              returnTo: window.location.pathname + window.location.search
            }
          }).catch((error) => {
            console.error('Login redirect failed:', error);
            // Clear auth flag on error
            sessionStorage.removeItem('auth_in_progress');
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
          bottom: '65px', // Position right above the BottomNav height
          width: '100%',
          zIndex: 999, // Just below BottomNav zIndex
          padding: '0px 8px 2px 0px', // Slight adjustment to padding
          background: 'transparent',
          display: 'flex',
          justifyContent: 'flex-end', // Ensure alignment to right side
        }}
      >
        <AppVersionFooter />
      </Box>

      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        width="100%"
        sx={{ 
          backgroundColor: 'transparent', 
          zIndex: 1000, 
          height: 65, 
          borderRadius: 0,
          overflow: 'hidden', // Prevent overflow to avoid scrolling
          maxWidth: '100vw' // Ensure it doesn't exceed viewport width
        }}
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
            // Set a maximum number of items to display based on available space
            '& > *': {
              flexGrow: 1, 
              maxWidth: 'none',
            },
            '& .MuiBottomNavigationAction-root.Mui-selected': {
              backgroundColor: theme.palette.primary.main,
              color: 'white',
            },
            '& .MuiBottomNavigationAction-root': {
              minWidth: '42px',
              padding: '0 0',
              fontSize: '0.6rem',
              // Make text smaller on mobile
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.6rem',  
                lineHeight: 1,
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              },
              // Progressively increase size with screen width
              '@media (min-width: 400px)': {
                minWidth: '56px',
                padding: '0 2px',
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.65rem',
                },
              },
              '@media (min-width: 600px)': {
                minWidth: '65px',
                padding: '0 4px',
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.7rem',
                },
              },
            },
          }}
          value={activeTab}
          onChange={handleChange}
          showLabels
          component="nav" // Semantic HTML5 element
          className="non-editable-nav"
        >
          {/* Home */}
          <BottomNavigationAction
            label="Home"
            icon={<HomeIcon />}
            aria-label="Go to home page"
            disabled={false}
          />

          {/* Survey (only for authenticated users when survey phase is enabled) */}
          <BottomNavigationAction
            label="Survey"
            icon={<ConnectWithoutContactIcon />}
            aria-label="Go to Save the Date Survey page"
            disabled={!auth0User}
            sx={{ 
              display: isFeatureEnabled('ENABLE_SURVEY_PHASE') && auth0User ? 'flex' : 'none'
            }}
          />

          {/* RSVP (only for authenticated users when RSVP is enabled) */}
          <BottomNavigationAction
            label="RSVP"
            icon={
              <Box sx={{ position: 'relative' }}>
                <SaveAsIcon />
                {/* New content dot - only shown if user hasn't visited RSVP page */}
                {!visitedPages.rsvp && (
                  <Box sx={{ 
                    position: 'absolute',
                    top: '-4px',
                    right: '-20px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.secondary.main,
                    boxShadow: `0 0 4px ${theme.palette.secondary.main}`
                  }} />
                )}
              </Box>
            }
            aria-label="Go to RSVP pages"
            disabled={!auth0User}
            sx={{ 
              display: isFeatureEnabled('ENABLE_RSVP_PHASE') && auth0User ? 'flex' : 'none'
            }}
          />

          {/* Details (only for authenticated users) */}
          <BottomNavigationAction
            label="Details"
            icon={
              <Box sx={{ position: 'relative' }}>
                <AutoAwesomeIcon />
                {/* New content dot - only shown if user hasn't visited Details page */}
                {!visitedPages.details && (
                  <Box sx={{ 
                    position: 'absolute',
                    top: '-4px',
                    right: '-20px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.secondary.main,
                    boxShadow: `0 0 4px ${theme.palette.secondary.main}`
                  }} />
                )}
              </Box>
            }
            aria-label="Go to detail pages"
            disabled={!auth0User}
            sx={{
              display: isFeatureEnabled('ENABLE_DETAILS') && auth0User  ? 'flex' : 'none'
            }}
          />

          {/* Registry (only for authenticated users) */}
          <BottomNavigationAction
            label="Registry"
            icon={
              <Box sx={{ position: 'relative' }}>
                <GiftCardIcon />
                {/* New content dot - only shown if user hasn't visited Registry page */}
                {!visitedPages.registry && (
                  <Box sx={{ 
                    position: 'absolute',
                    top: '-4px',
                    right: '-20px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.secondary.main,
                    boxShadow: `0 0 4px ${theme.palette.secondary.main}`
                  }} />
                )}
              </Box>
            }
            aria-label="Go to registry page"
            disabled={!auth0User}
            sx={{
              display: isFeatureEnabled('ENABLE_REGISTRY') && auth0User ? 'flex' : 'none',
            }}
          />

          {/* Stats (only for authenticated users) */}
          <BottomNavigationAction
            label="Stats"
            icon={              
              <Box sx={{ position: 'relative' }}>
                <BarChartIcon />
                {/* New content dot - only shown if user hasn't visited Stats page */}
                {!visitedPages.stats && (
                  <Box sx={{ 
                    position: 'absolute',
                    top: '-4px',
                    right: '-20px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.secondary.main,
                    boxShadow: `0 0 4px ${theme.palette.secondary.main}`
                  }} />
                )}
              </Box>
            }
            aria-label="View wedding statistics"
            disabled={!auth0User}
            sx={{ 
              display: auth0User ? 'flex' : 'none',
            }}
          />

          {/* Bureaucracy */}
          <BottomNavigationAction
            label="Bureaucracy"
            icon={<GavelIcon />}
            aria-label="View legal information and bureaucracy pages"
            disabled={false}
          />

          {/* Admin Updates (only for admin users) */}
          <BottomNavigationAction
            label="Admin"
            icon={<AutoFixHighIcon />}
            aria-label="Update Users"
            disabled={!userIsAdmin}
            sx={{
              display: userIsAdmin ? 'flex' : 'none',
            }}
          />

          {/* Printed RSVP (only for admin users) */}
          {/* <BottomNavigationAction
            label="Printed RSVP"
            icon={<PrintIcon />}
            aria-label="View Printed RSVP"
            disabled={!userIsAdmin}
            sx={{
              display: userIsAdmin ? 'flex' : 'none',
            }}
          /> */}

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
