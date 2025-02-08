import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestDto, NotificationPreferenceEnum, SleepPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup } from '@mui/material';
import { Apartment, EmailOutlined, Festival, HotelOutlined, PhoneAndroid } from '@mui/icons-material';
import { useMemo } from 'react';

const CampingPreferences = ({ guestId }: { guestId: string }) => {
  const guest: GuestDto | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const campingPreferences = Object.keys(SleepPreferenceEnum);
  const guestCommunicationPreferences = useMemo(() => {
    return guest?.preferences?.notificationPreference || [];
  }, [guest]);

  return (
    <Box display="flex" width="100%" alignItems="baseline" justifyContent="space-between" flexWrap="wrap" mb={2}>
      <Typography variant="h5" width="100%" mb={2}>{guest?.firstName}</Typography>
      <ButtonGroup variant="outlined" size="small" color="secondary" sx={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,.6)' }}>
        {campingPreferences.map((value) => (
          <Button
            size='large'
            disabled={familyActions.updateFamilyMutation.isPending}
            onClick={() => familyActions.updateFamilyGuestSleepingPreference(guestId, SleepPreferenceEnum[value])}
            variant={(guest?.preferences?.sleepPreference?.includes(SleepPreferenceEnum[value]) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
            key={value}
            startIcon={value === 'Camping' ? <Festival /> : value === "Hotel" ? <Apartment /> : <HotelOutlined />}
          >
            <Box>
              <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'}>
                <Typography height={80} alignContent={'center'} width='100%' fontWeight={'bold'}>
                  {value}
                </Typography>
              </Box>
            </Box>
          </Button>
        ))}
      </ButtonGroup>

    </Box>
  );
};

export default CampingPreferences;