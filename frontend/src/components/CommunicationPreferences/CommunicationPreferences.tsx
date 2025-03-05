import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestViewModel, NotificationPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup, darken, useTheme, Paper } from '@mui/material';
import { EmailOutlined, PhoneAndroid } from '@mui/icons-material';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Stack } from '@mui/system';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

const CommunicationPreferences = ({ guestId }: { guestId: string }) => {
  const { screenWidth } = useAppLayout();
  const guest: GuestViewModel | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const contactPreferences = Object.keys(NotificationPreferenceEnum);
  const mousePosition = useRef({ x: 0, y: 0 });
  const theme = useTheme();
  
  const guestCommunicationPreferences = useMemo(() => {
    return guest?.preferences?.notificationPreference || [];
  }, [guest]);
  
  const guestEmailAddress = useMemo(() => {
    return guest?.email?.maskedValue;
  }, [guest]);
  
  const guestPhoneNumber = useMemo(() => {
    return guest?.phone?.maskedValue;
  }, [guest]);

  const handleUpdateCommunicationPreference = (notificationPreference: NotificationPreferenceEnum) => {
    const existingPreferencesArray = guestCommunicationPreferences;
    if (existingPreferencesArray.includes(notificationPreference)) {
      const filteredPreferences = existingPreferencesArray.filter((value) => value !== notificationPreference);
      return familyActions.updateFamilyGuestCommunicationPreference(guestId, filteredPreferences);
    } else {
      const updatedPreferencesArray = [...existingPreferencesArray, notificationPreference];
      return familyActions.updateFamilyGuestCommunicationPreference(guestId, updatedPreferencesArray);
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const calculateShadow = () => {
    const { x, y } = mousePosition.current;
    const shadowX = (x / window.innerWidth) * 15 + 5;
    const shadowY = (y / window.innerHeight) * 15 + 5;
    return `${shadowX}px ${shadowY}px 0px ${darken(theme.palette.primary.main, 0.85)}`;
  };
  
  return (
    <Stack
      display="flex"
      width="100%"
      height="100%"
      my="auto"
      justifyContent="center"
      alignItems="center"
      px={2}
      onMouseMove={handleMouseMove}
      data-testid="stack-container"
    >
      <Paper
        elevation={5}
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.1)',
          filter: `drop-shadow(${calculateShadow()})`,
          width: '100%',
        }}
        data-testid="paper-container"
      >
        <ButtonGroup 
          fullWidth
          variant="outlined" 
          color="secondary" 
          orientation={screenWidth > 800 ? 'horizontal' : 'vertical'} 
          sx={{ 
            backgroundColor: 'rgba(0,0,0,.8)'
          }}
          data-testid="button-group"
        >
          {contactPreferences.map((value) => (
            <Button
              sx={{
                width: '100%',
              }}
              disabled={familyActions.patchFamilyMutation.isPending || familyActions.getFamilyUnitQuery.isFetching}
              onClick={() => handleUpdateCommunicationPreference(NotificationPreferenceEnum[value])}
              variant={(guest?.preferences?.notificationPreference?.includes(NotificationPreferenceEnum[value]) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
              key={value}
              data-testid={`button-${value.toLowerCase()}`}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Box display={'flex'} alignItems={'center'} justifyContent="center" width="100%">
                  {value === 'Email' 
                    ? <EmailOutlined sx={{ mr: 1 }} data-testid="email-icon" /> 
                    : <PhoneAndroid sx={{ mr: 1 }} data-testid="phone-icon" />
                  }
                  <Typography>{value}</Typography>
                </Box>
                <Typography variant="caption">{value === 'Email' ? guestEmailAddress || '' : guestPhoneNumber || ''}</Typography>
              </Box>
            </Button>
          ))}
        </ButtonGroup>
      </Paper>
    </Stack>
  );
};

export default CommunicationPreferences;