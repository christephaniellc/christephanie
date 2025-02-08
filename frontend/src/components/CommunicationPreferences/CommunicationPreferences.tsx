import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestDto, NotificationPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup } from '@mui/material';
import { EmailOutlined, PhoneAndroid } from '@mui/icons-material';
import { useMemo } from 'react';

const CommunicationPreferences = ({ guestId }: { guestId: string }) => {
  const guest: GuestDto | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const contactPreferences = Object.keys(NotificationPreferenceEnum);
  const guestCommunicationPreferences = useMemo(() => {
    return guest?.preferences?.notificationPreference || [];
  }, [guest]);
  const guestEmailAddress = useMemo(() => {
    return guest?.email;
  }, [guest]);
  const guestPhoneNumber = useMemo(() => {
    return guest?.phone;
  }, [guest]);

  return (
    <Box display="flex" width="100%" alignItems="baseline" justifyContent="space-between" flexWrap="wrap" mb={2}>
      <Typography variant="h5" width="100%" mb={2}>{`${guest?.firstName}`}</Typography>
      <ButtonGroup variant="outlined" size="small" color="secondary">
        {contactPreferences.map((value) => (
          <Button
            disabled={familyActions.updateFamilyMutation.isPending}
            onClick={() => familyActions.updateFamilyGuestCommunicationPreference(guestId, [...guestCommunicationPreferences, NotificationPreferenceEnum[value]])}
            variant={(guest?.preferences?.notificationPreference?.includes(NotificationPreferenceEnum[value]) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
            key={value}
          >
            <Box>
              <Box display={'flex'} alignItems={'center'}>{value === 'Email' ? <EmailOutlined /> : <PhoneAndroid />}<Typography width='100%'>{value}</Typography></Box>
              <Typography variant="caption" width='100%'>{value === 'Email' ? guestEmailAddress : guestPhoneNumber}</Typography>
            </Box>
          </Button>
        ))}
      </ButtonGroup>

    </Box>
  );
};

export default CommunicationPreferences;