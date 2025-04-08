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
}

// TabPanel component for displaying tab content
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`details-tabpanel-${index}`}
      aria-labelledby={`details-tab-${index}`}
      {...other}
      style={{ width: '100%', height: '100%' }}
    >
      {value === index && (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* Custom background for each tab */}
          {index === 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/src/assets/engagement-photos/topher_and_steph_rsvp3.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.1,
                zIndex: 0,
              }}
            />
          )}
          {index === 1 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/src/assets/holiday-inn-express-brunswick.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.05,
                zIndex: 0,
              }}
            />
          )}
          {index === 3 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(45deg, rgba(76,175,80,0.05) 0%, rgba(33,150,243,0.05) 50%, rgba(156,39,176,0.05) 100%)',
                zIndex: 0,
              }}
            />
          )}
          {children}
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
    }
  }, [location.pathname]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);

    // Update URL when tab changes
    const tabKeys = Object.keys(detailsRoutes);
    if (newValue < tabKeys.length) {
      const tabKey = tabKeys[newValue];
      navigate(detailsRoutes[tabKey].path);
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
    {
      label: 'Things to Do',
      component: detailsComponents.thingsToDo,
      enabled: isFeatureEnabled('ENABLE_DETAILS_THINGS_TO_DO'),
      path: '/details/things-to-do',
    },
  ];

  // Filter out disabled items
  const enabledDetailItems = detailItems.filter((item) => item.enabled);

  return (
    <Container
      sx={{
        width: '100%',
        height: contentHeight,
        overflow: 'hidden',
        borderRadius: 'sm',
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative',
        padding: `0 !important`, // Remove default padding for the tabs to extend full width
        margin: `0 !important`,
      }}
      data-testid="details-container"
    >
      <Paper
        square
        elevation={3}
        sx={{
          width: '100%',
          position: 'sticky',
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
            [theme.breakpoints.up('md')]: {
              justifyContent: 'center',
            },
          }}
        >
          {enabledDetailItems.map((item, index) => (
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
          height: `calc(${contentHeight} - 48px - 80px - 40px)`, // Height minus tabs, banner and bottom padding
        }}
      >
        {enabledDetailItems.map((item, index) => (
          <TabPanel key={index} value={tabIndex} index={index}>
            {item.component}
          </TabPanel>
        ))}
      </Box>
    </Container>
  );
}

export default DetailsPage;
