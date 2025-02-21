import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestDto, SleepPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup } from '@mui/material';
import { Apartment, Festival, HotelOutlined } from '@mui/icons-material';
import React from 'react';

const CampingPreferences = ({ guestId }: { guestId: string }) => {
  const guest: GuestDto | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const campingPreferences = Object.keys(SleepPreferenceEnum);

  const handleChangeSleepPreference = (value: SleepPreferenceEnum) => {
    if (guest?.preferences?.sleepPreference === value) {
      familyActions.updateFamilyGuestSleepingPreference(guestId, SleepPreferenceEnum.Unknown);
    } else {
      familyActions.updateFamilyGuestSleepingPreference(guestId, value);
    }
  };

  return (
    <Box width="100%" mb={2}>
      <Typography variant="h5" width="100%" mb={2}>{guest?.firstName}</Typography>
      <Box width='100%' sx={{ overflow: 'auto' }}>
        <ButtonGroup variant="outlined" size="small" color="secondary"
                     sx={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,.6)' }}>
          {campingPreferences.map((value) => (
            <Button
              size="large"
              disabled={familyActions.patchFamilyMutation.isPending || familyActions.getFamilyUnitQuery.isFetching}
              sx={{ px: value === 'Unknown' ? 0 : 3, minWidth: value === 'Unknown' ? '0.5px !important' : 40 }}
              onClick={() => handleChangeSleepPreference(SleepPreferenceEnum[value])}
              variant={(guest?.preferences?.sleepPreference?.includes(SleepPreferenceEnum[value]) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
              key={value}
              startIcon={value === 'Camping' ? <Festival /> : value === 'Hotel' ?
                <Apartment /> : value === 'Unknown' ? '' : <HotelOutlined />}
            >
              <Box>
                <Box display={'flex'} alignItems={'center'} flexWrap="wrap">
                  <Typography height={80} alignContent={'center'} width="100%" fontWeight={'bold'}>
                    {value === 'Unknown' ? '' : value}
                  </Typography>
                </Box>
              </Box>
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default CampingPreferences;