import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { useState, ReactElement } from 'react';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import PrivacyPolicy from '../../components/PrivacyPolicy/PrivacyPolicy';
import TermsOfService from '@/components/TermsOfService';
import AboutUs from '@/components/AboutUs';

// Type definition for legal items that can be displayed in tabs
interface LegalItem {
  label: string;
  component: ReactElement;
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

function Bureaucracy() {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);

  // Legal items array (Bureaucracy only for now, more will be added manually)
  const legalItems: LegalItem[] = [
    {
      label: 'About Christephanie LLC',
      component: <AboutUs />,
    },
    {
      label: 'Privacy Policy',
      component: <PrivacyPolicy />,
    },
    {
      label: 'Terms of Service',
      component: <TermsOfService />,
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

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
          {legalItems.map((item, index) => (
            <Tab
              key={index}
              label={item.label}
              {...a11yProps(index)}
              sx={{
                fontWeight: 'bold',
                '&.Mui-selected': {
                  color: theme.palette.secondary.main,
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
          height: `calc(${contentHeight} - 48px - 80px)`, // Height minus tabs and bottom padding
        }}
      >
        {legalItems.map((item, index) => (
          <TabPanel key={index} value={tabIndex} index={index}>
            {item.component}
          </TabPanel>
        ))}
      </Box>
    </Container>
  );
}

export default Bureaucracy;
