import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { useState, ReactElement } from 'react';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import AboutUsCouple from '@/components/Info/AboutUsCouple';
import Accommodations from '@/components/Info/Accommodations';
import Travel from '@/components/Info/Travel';
import Attire from '@/components/Info/Attire';
import Schedule from '@/components/Info/Schedule';
import ThingsToDo from '@/components/Info/ThingsToDo';
import { isFeatureEnabled } from '@/config';

// Type definition for legal items that can be displayed in tabs
interface DetailItem {
  label: string;
  component: ReactElement;
  enabled: boolean;
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
      id={`legal-tabpanel-${index}`}
      aria-labelledby={`legal-tab-${index}`}
      {...other}
      style={{ width: '100%', height: '100%' }}
    >
      {value === index && <Box sx={{ width: '100%', height: '100%' }}>{children}</Box>}
    </div>
  );
}

// Helper function for tab accessibility props
function a11yProps(index: number) {
  return {
    id: `legal-tab-${index}`,
    'aria-controls': `legal-tabpanel-${index}`,
  };
}

function Detail() {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleTabLink = (to: string) => {
    
    return setTabIndex(() => {
      switch(to) {
        case 'aboutUsCouple':
          return 1;
        case 'accommodations':
          return 2;
        case 'travel':
          return 3;
        case 'attire':
          return 4;
        case 'schedule':
          return 5;
        case 'thingsToDo':
          return 6;
        default:
          return 0;
      }
    });
  };

  // Details items array 
  const detailItems: DetailItem[] = [
    {
      label: 'Steph & Topher',
      component: <AboutUsCouple handleTabLink={handleTabLink} />,
      enabled: isFeatureEnabled('ENABLE_DETAILS_ABOUTUS')
    },
    {
      label: 'Accommodations',
      component: <Accommodations handleTabLink={handleTabLink} />,
      enabled: isFeatureEnabled('ENABLE_DETAILS_ACCOMMODATIONS')
    },
    {
      label: 'Travel',
      component: <Travel handleTabLink={handleTabLink} />,
      enabled: isFeatureEnabled('ENABLE_DETAILS_TRAVEL')
    },
    {
      label: 'Attire',
      component: <Attire handleTabLink={handleTabLink} />,
      enabled: isFeatureEnabled('ENABLE_DETAILS_ATTIRE')
    },
    {
      label: 'Schedule',
      component: <Schedule handleTabLink={handleTabLink} />,
      enabled: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE')
    },
    {
      label: 'Things to Do',
      component: <ThingsToDo handleTabLink={handleTabLink} />,
      enabled: isFeatureEnabled('ENABLE_DETAILS_THINGS_TO_DO')
    },
  ];

  return (
    <Container
      sx={{
        width: '100%',
        height: contentHeight,
        overflow: 'hidden',
        borderRadius: 'sm',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: '80px', // Padding to avoid content being hidden behind BottomNav
        padding: 0, // Remove default padding for the tabs to extend full width
      }}
      data-testid="bureaucracy-container"
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
          variant="fullWidth"
          textColor="primary"
          indicatorColor="secondary"
          aria-label="Legal document tabs"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
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
                display: item.enabled ? 'flex' : 'none'
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
          height: `calc(${contentHeight} - 48px - 80px)`, // Height minus tabs and bottom padding
        }}
      >
        {detailItems.map((item, index) => (
          <TabPanel key={index} value={tabIndex} index={index}>
            {item.component}
          </TabPanel>
        ))}
      </Box>
    </Container>
  );
}

export default Detail;
