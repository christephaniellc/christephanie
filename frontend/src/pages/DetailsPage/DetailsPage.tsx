import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { useState, ReactElement, useEffect } from 'react';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import AboutUs from '@/components/DetailsPages/AboutUs';
import Accommodations from '@/components/DetailsPages/Accommodations';
import Travel from '@/components/DetailsPages/Travel/Travel';
import Attire from '@/components/DetailsPages/Attire/Attire';
import Schedule from '@/components/DetailsPages/Schedule/Schedule';
import ThingsToDo from '@/components/DetailsPages/ThingsToDo';
import { isFeatureEnabled } from '@/config';
import { detailsRoutes } from '@/routes/details-routes';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton';

// Type definition for detail items that can be displayed in tabs
interface DetailItem {
  label: string;
  component: ReactElement;
  enabled: boolean;
  icon?: React.ReactNode;
  path: string;
}

// Interface for TabPanel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  enabled: boolean;
}

// TabPanel component for displaying tab content
function TabPanel(props: TabPanelProps) {
  const { children, value, index, enabled, ...other } = props;
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`details-tabpanel-${index}`}
      aria-labelledby={`details-tab-${index}`}
      {...other}
      style={{ width: '100%', height: 'auto', overflow: 'visible'}}
    >
      {value === index && (
        <Box sx={{ width: '100%', height: 'auto', position: 'relative', overflow: 'visible' }}>
          {/* Custom background for each tab */}
          {index === 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                width: '100%', // Use viewport width
                height: '100%',
                left: '50%',
                transform: 'translateX(-50%)', // Center the background
                backgroundImage: 'url(/src/assets/engagement-photos/topher_and_steph_rsvp2.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.1,
                zIndex: 0,
              }}
            />
          )}
          {index === 1 && ( // Accommodations tab background
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                width: '100vw', // Use viewport width
                height: '100%',
                left: '50%',
                transform: 'translateX(-50%)', // Center the background
                backgroundImage: 'url(/src/assets/holiday-inn-express-brunswick.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.05,
                zIndex: 0,
              }}
            />
          )}
          {index === 3 && ( // Attire tab background
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                width: '100vw', // Use viewport width
                height: '100%',
                left: '50%',
                transform: 'translateX(-50%)', // Center the background
                background:
                  'linear-gradient(45deg, rgba(76,175,80,0.05) 0%, rgba(33,150,243,0.05) 50%, rgba(156,39,176,0.05) 100%)',
                zIndex: 0,
              }}
            />
          )}
          {enabled ? (
            children
          ) : (
            <Container
              disableGutters
              maxWidth={false}
              sx={{
                width: '100vw', // Full viewport width
                maxWidth: 'none !important', // Override all max-width settings
                overflow: 'auto',
                borderRadius: 'sm',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                paddingBottom: '80px',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                padding: 0,
                margin: 0,
                left: '50%',
                transform: 'translateX(-50%)', // Center the container
                backgroundColor: 'black', // Add black background color
                height: '100vh', // Make it full height of viewport
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker overlay
                  backdropFilter: 'blur(2px)',
                  zIndex: 0
                },
              }}
            >
              <Box sx={{ 
                width: '100%',
                mt: 4,
                pb: 2,
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <StephsActualFavoriteTypography variant="h4" sx={{ 
                  textAlign: 'center',
                  fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
                }}>
                COMING SOON
                </StephsActualFavoriteTypography>

                {/* Circular logo with animation */}
                <Box
                  sx={{
                    width: '100%',
                    height: '120px',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' }
                    },
                    '& img': {
                      height: '120px',
                      width: '120px',
                      animation: 'pulse 3s infinite ease-in-out',
                    }
                  }}
                >
                  <img 
                    src="/favicon_big_art_transparent.png" 
                    alt="Wedding Logo" 
                  />
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    textAlign: 'center',
                    maxWidth: '600px',
                    mt: 2,
                    mb: 4,
                    px: 2,
                  }}
                >
                  We are currently working on this section. Please check back later for updates!
                </Typography>
              </Box>
            </Container>
          )}
        </Box>
      )}
    </div>
  );
}

// Helper function for tab accessibility props
function a11yProps(index: number) {
  return {
    id: `details-tab-${index}`,
    'aria-controls': `details-tabpanel-${index}`,
  };
}

// Maps URL paths to tab indices
const pathToTabIndex: Record<string, number> = {
  '/details': 0,
  '/details/about-us': 0,
  '/details/accommodations': 1,
  '/details/travel': 2,
  '/details/attire': 3,
  '/details/schedule': 4,
  '/details/things-to-do': 5,
};

function DetailsPage() {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Initial tab index based on the current URL path
  const initialTabIndex = pathToTabIndex[location.pathname] || 0;
  const [tabIndex, setTabIndex] = useState(initialTabIndex);

  // Update tab index when location changes
  useEffect(() => {
    const newTabIndex = pathToTabIndex[location.pathname] || 0;
    if (newTabIndex !== tabIndex) {
      setTabIndex(newTabIndex);
      
      // Scroll first tab into view when it's selected
      if (newTabIndex === 0) {
        setTimeout(() => {
          const tabsContainer = document.querySelector('.MuiTabs-scroller');
          if (tabsContainer) {
            tabsContainer.scrollLeft = 0;
          }
        }, 100);
      }
    }
  }, [location.pathname, tabIndex]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);

    // Update URL when tab changes
    const tabKeys = Object.keys(detailsRoutes);
    if (newValue < tabKeys.length) {
      const tabKey = tabKeys[newValue];
      navigate(detailsRoutes[tabKey].path);
      
      // Ensure selected tab is fully visible (especially important for first tab)
      setTimeout(() => {
        const tabs = document.querySelectorAll('.MuiTab-root');
        if (tabs && tabs[newValue]) {
          (tabs[newValue] as HTMLElement).scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'center' 
          });
        }
      }, 100);
    } else {
      navigate('/details');
    }
  };

  const handleTabLink = (to: string) => {
    return setTabIndex(() => {
      switch (to) {
        case 'aboutUs':
          navigate('/details/about-us');
          return 0;
        case 'accommodations':
          navigate('/details/accommodations');
          return 1;
        case 'travel':
          navigate('/details/travel');
          return 2;
        case 'attire':
          navigate('/details/attire');
          return 3;
        case 'schedule':
          navigate('/details/schedule');
          return 4;
        case 'thingsToDo':
          navigate('/details/things-to-do');
          return 5;
        default:
          navigate('/details');
          return 0;
      }
    });
  };

  // Location data using actual wedding details
  const locationInfo = {
    venue: 'Stone Manor',
    address: '13193 Mountain Rd',
    city: 'Lovettsville',
    state: 'VA',
    zip: '20180',
    date: 'July 5, 2025 at 6:00pm',
  };

  // Map details routes to components
  const detailsComponents = {
    aboutUs: <AboutUs handleTabLink={handleTabLink} />,
    accommodations: <Accommodations handleTabLink={handleTabLink} />,
    travel: <Travel handleTabLink={handleTabLink} />,
    attire: <Attire handleTabLink={handleTabLink} />,
    schedule: <Schedule handleTabLink={handleTabLink} />,
    thingsToDo: <ThingsToDo handleTabLink={handleTabLink} />,
  };

  // Details items array with all tabs enabled
  const detailItems: DetailItem[] = [
    {
      label: 'About Us',
      component: detailsComponents.aboutUs,
      enabled: isFeatureEnabled('ENABLE_DETAILS_ABOUTUS'),
      path: '/details/about-us',
    },
    {
      label: 'Accommodations',
      component: detailsComponents.accommodations,
      enabled: isFeatureEnabled('ENABLE_DETAILS_ACCOMMODATIONS'),
      path: '/details/accommodations',
    },
    {
      label: 'Travel',
      component: detailsComponents.travel,
      enabled: isFeatureEnabled('ENABLE_DETAILS_TRAVEL'),
      path: '/details/travel',
    },
    {
      label: 'Attire',
      component: detailsComponents.attire,
      enabled: isFeatureEnabled('ENABLE_DETAILS_ATTIRE'),
      path: '/details/attire',
    },
    {
      label: 'Schedule',
      component: detailsComponents.schedule,
      enabled: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE'),
      path: '/details/schedule',
    },
    // {
    //   label: 'Things to Do',
    //   component: detailsComponents.thingsToDo,
    //   enabled: isFeatureEnabled('ENABLE_DETAILS_THINGS_TO_DO'),
    //   path: '/details/things-to-do',
    // },
  ];

  return (
    <Container 
      disableGutters
      maxWidth={false}
      sx={{
        width: '100%',
        height: contentHeight,
        overflow: 'auto', // Changed from 'hidden' to 'auto' to allow scrolling
        borderRadius: 'sm',
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative',
        padding: 0,
        margin: 0,
      }}
      data-testid="details-container"
    >
      <Paper
        square
        elevation={3}
        sx={{
          width: '100%',
          position: 'sticky',
          maxWidth: '100%',
          overflowX: 'auto',
          top: 0,
          zIndex: 100,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="secondary"
          aria-label="Wedding details tabs"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            width: '100%', // Ensure tabs take full width
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center', // Center the tab items
              paddingLeft: { 
                xs: '12px', 
                sm: '330px', 
                md: 0, 
                lg: 0, 
                xl: 0 
              }, // Add left padding on mobile to make first tab more accessible
            },
          }}
        >
          {detailItems.map((item, index) => (
            <Tab
              key={index}
              label={item.label}
              {...a11yProps(index)}
              sx={{
                fontWeight: 'bold',
                '&.Mui-selected': {
                  color: theme.palette.secondary.main,
                },
                fontSize: {
                  xs: '0.75rem',
                  sm: '0.875rem',
                  md: '1rem',
                },
                minWidth: {
                  xs: '80px',
                  sm: '120px',
                  md: '160px',
                },
              }}
              data-testid={`tab-${index}`}
            />
          ))}
        </Tabs>
      </Paper>

      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          overflowY: 'auto',
          height: `calc(${contentHeight} - 48px)`, // Simplified height calculation
          maxWidth: '100%',
          backgroundColor: 'black', // Add black background for the content area
        }}
      >
        {detailItems.map((item, index) => (
          <TabPanel key={index} value={tabIndex} index={index} enabled={item.enabled}>
            {item.component}
          </TabPanel>
        ))}
      </Box>
    </Container>
  );
}

export default DetailsPage;
