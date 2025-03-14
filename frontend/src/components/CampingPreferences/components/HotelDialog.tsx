import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Tabs,
  Tab,
  Box,
  useTheme,
  Paper
} from '@mui/material';
import { HotelDialogProps } from '../types';
import HotelDetail from './HotelDetail';

// TabPanel component for displaying tab content
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hotel-tabpanel-${index}`}
      aria-labelledby={`hotel-tab-${index}`}
      {...other}
      style={{ width: '100%', height: '100%' }}
    >
      {value === index && <Box sx={{ width: '100%', height: '100%', p: 2 }}>{children}</Box>}
    </div>
  );
}

// Helper function for tab accessibility props
function a11yProps(index: number) {
  return {
    id: `hotel-tab-${index}`,
    'aria-controls': `hotel-tabpanel-${index}`,
  };
}

const HotelDialog: React.FC<HotelDialogProps> = ({ open, onClose, hotelOptions }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(30, 30, 35, 0.9)',
          backgroundImage: 'none',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.secondary.main}`,
          borderRadius: 2,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
        }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Paper
          square
          elevation={3}
          sx={{
            width: '100%',
            position: 'sticky',
            top: 0,
            zIndex: 150,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="secondary"
            aria-label="Hotel options tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {hotelOptions.map((hotel, index) => (
              <Tab
                key={index}
                label={hotel.name.split(',')[0]} // Show only the main part of the name
                {...a11yProps(index)}
                sx={{
                  fontWeight: 'bold',
                  '&.Mui-selected': {
                    color: theme.palette.secondary.main,
                  },
                }}
                data-testid={`hotel-tab-${index}`}
              />
            ))}
          </Tabs>
        </Paper>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0, minHeight: 400 }}>
        {hotelOptions.map((hotel, index) => (
          <TabPanel key={index} value={tabIndex} index={index}>
            <HotelDetail hotel={hotel} />
          </TabPanel>
        ))}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HotelDialog;