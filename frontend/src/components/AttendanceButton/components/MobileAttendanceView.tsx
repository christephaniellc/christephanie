import React from 'react';
import { 
  Box, 
  Typography, 
  List,
  ListItem,
  ListSubheader,
  Paper
} from '@mui/material';
import { useRecoilValue } from 'recoil';
import { guestSelector } from '@/store/family';
import { useAuth0 } from '@auth0/auth0-react';
import { stdStepperState } from '@/store/steppers/steppers';
import { AttendanceButtonStatus } from './AttendanceButtonStatus';
import { useAttendanceButtonContainer } from '../hooks/useAttendanceButtonContainer';
import FoodPreferences from '@/components/FoodPreferences/FoodPreferences';
import CommunicationPreferences from '@/components/CommunicationPreferences';
import CampingPreferences from '@/components/CampingPreferences';
import AgeSelector from '@/components/AgeSelector';
import FoodAllergies from '@/components/FoodPreferences';

interface MobileAttendanceViewProps {
  guestId: string;
}

export const MobileAttendanceView = ({ guestId }: MobileAttendanceViewProps) => {
  const { semiTransparentBackgroundColor, theme, guest, getResponseColor } = useAttendanceButtonContainer({ guestId });
  const stdStepper = useRecoilValue(stdStepperState);
  const { user } = useAuth0();

  // Determine the current component based on step
  const getCurrentComponent = () => {
    switch (stdStepper.currentStep[0]) {
      case 'ageGroup':
        return <AgeSelector guestId={guestId} />;
      case 'foodPreferences':
        return <FoodPreferences guestId={guestId} />;
      case 'foodAllergies':
        return <FoodAllergies guestId={guestId} />;
      case 'communicationPreference':
        return <CommunicationPreferences guestId={guestId} />;
      case 'camping':
        return <CampingPreferences guestId={guestId} />;
      default:
        return <></>;
    }
  };

  return (
    <Box
      data-testid="mobile-attendance-view"
      sx={{
        width: '100%',
        height: 'auto', // Only take the height we need
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(16px)',
        borderTop: `2px solid ${semiTransparentBackgroundColor}`,
        borderRight: `2px solid ${semiTransparentBackgroundColor}`,
        borderBottom: `2px solid ${semiTransparentBackgroundColor}`,
        backgroundColor: semiTransparentBackgroundColor,
      }}
    >
      <List
        sx={{
          width: '100%',
          height: 'auto', // Only take the height we need
          p: 0,
          '& ul': { padding: 0 },
          bgcolor: 'transparent',
        }}
        subheader={<li />}
      >
        <li>
          <ul>
            <ListSubheader
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backgroundColor: theme.palette.background.default,
                backdropFilter: 'blur(16px)',
                borderRadius: 1,
                boxShadow: 2,
                p: 1,
                mb: 1,
                borderLeft: `4px solid ${getResponseColor()}`,
              }}
            >
              <Typography variant="h6" component="div" color={getResponseColor()}>
                {guest?.auth0Id === user?.sub ? 'You' : guest?.firstName}
              </Typography>
              <Typography variant="body2" color={getResponseColor()}>
                {guest?.rsvp.invitationResponse}
              </Typography>
            </ListSubheader>
            
            <ListItem 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                p: 0,
                mb: 2,
                // Auto-height based on content
                height: 'auto',
              }}
            >
              <Paper 
                elevation={3}
                sx={{ 
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 'auto',
                  py: 0.5,
                }}
              >
                <AttendanceButtonStatus guestId={guestId} />
              </Paper>
            </ListItem>
            
            <ListItem 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                p: 1,
                mt: 0, // Remove any top margin
                // Auto-height based on content
                height: 'auto',
                justifyContent: 'center', // Center content horizontally
              }}
            >
              <Box 
                sx={{ 
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center', // Center the component container
                }}
              >
                {getCurrentComponent()}
              </Box>
            </ListItem>
          </ul>
        </li>
      </List>
    </Box>
  );
};