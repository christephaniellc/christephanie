import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestDto, GuestViewModel, NotificationPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup } from '@mui/material';
import { EmailOutlined, PhoneAndroid } from '@mui/icons-material';
import { useMemo } from 'react';

const CommunicationPreferences = ({ guestId }: { guestId: string }) => {
  const guest: GuestViewModel | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const contactPreferences = Object.keys(NotificationPreferenceEnum);
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
  }
  return (
    <Box display="flex" width="100%" alignItems="baseline" justifyContent="space-between" flexWrap="wrap">
      <ButtonGroup variant="outlined" size="small" color="secondary" orientation='vertical' sx={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,.6)' }}>
        {contactPreferences.map((value) => (
          <Button
            disabled={familyActions.patchFamilyMutation.isPending || familyActions.getFamilyUnitQuery.isFetching}
            onClick={() => handleUpdateCommunicationPreference(NotificationPreferenceEnum[value])}
            variant={(guest?.preferences?.notificationPreference?.includes(NotificationPreferenceEnum[value]) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
            key={value}
          >
            <Box>
              <Box display={'flex'} alignItems={'center'}>{value === 'Email' ? <EmailOutlined /> : <PhoneAndroid />}<Typography width='100%'>{value}</Typography></Box>
              <Typography variant="caption" width='100%'>{value === 'Email' ? guestEmailAddress || '' : guestPhoneNumber || ''}</Typography>
            </Box>
          </Button>
        ))}
      </ButtonGroup>

    </Box>
  );
};

export default CommunicationPreferences;