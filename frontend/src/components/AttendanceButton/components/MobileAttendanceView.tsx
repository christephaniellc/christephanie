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
import StickFigureIcon from '@/components/StickFigureIcon';
import WeddingAttendanceRadios from '@/components/WeddingAttendanceRadios';
import { InvitationResponseEnum } from '@/types/api';

interface MobileAttendanceViewProps {
  guestId: string;
}

export const MobileAttendanceView = ({ guestId }: MobileAttendanceViewProps) => {
  const { semiTransparentBackgroundColor, theme, guest, getResponseColor } = useAttendanceButtonContainer({ guestId });
  const stdStepper = useRecoilValue(stdStepperState);
  const { user } = useAuth0();
  
  // Add these variables to match AttendanceButton logic
  const isNonAttendanceStep = stdStepper.tabIndex > 0;
  const isAttendanceStep = !isNonAttendanceStep;
  const isAttending = guest?.rsvp?.invitationResponse === InvitationResponseEnum.Interested;
  const showStepContent = isAttendanceStep || isAttending;

  // Determine the current component based on step
  const getCurrentComponent = () => {
    // Only show step components if we're on the attendance step or if the guest is attending
    if (!showStepContent) return <></>;
    
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
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backgroundColor: theme.palette.background.default,
                backdropFilter: 'blur(16px)',
                borderRadius: 1,
                boxShadow: 2,
                p: 1.5,
                mb: 1,
                borderLeft: `4px solid ${getResponseColor()}`,
                height: 'auto',
                minHeight: '65px'
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" component="div" color={getResponseColor()}>
                      {guest?.auth0Id === user?.sub ? 'You' : guest?.firstName}
                    </Typography>
                    {guest?.ageGroup && (
                      <Box ml={1} display="flex" alignItems="center">
                        <StickFigureIcon 
                          ageGroup={guest.ageGroup} 
                          fontSize="small" 
                          color={getResponseColor()} 
                        />
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color={getResponseColor()}>
                    {guest?.rsvp.invitationResponse}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: '100%', 
                  mt: 1,
                  fontSize: '0.7rem',
                  color: getResponseColor(),
                  opacity: 0.9
                }}>
                  <WeddingAttendanceRadios guestId={guestId} />
                </Box>
              </Box>
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
            
            {/* Only show step content if the guest is attending or on attendance step */}
            {showStepContent && (
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
            )}
          </ul>
        </li>
      </List>
    </Box>
  );
};