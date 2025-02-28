import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestDto, SleepPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup, darken, useTheme } from '@mui/material';
import { Apartment, Festival, HotelOutlined } from '@mui/icons-material';
import React, { useEffect, useRef } from 'react';
import { Stack } from '@mui/system';
import Paper from '@mui/material/Paper';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

const CampingPreferences = ({ guestId }: { guestId: string }) => {
  const { screenWidth } = useAppLayout();
  const guest: GuestDto | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const campingPreferences = Object.keys(SleepPreferenceEnum);
  const mousePosition = useRef({ x: 0, y: 0 });
  const theme = useTheme();
  const [campingValue, setCampingValue] = React.useState<SleepPreferenceEnum>(
    SleepPreferenceEnum.Unknown,
  );
  const handleChangeSleepPreference = (value: SleepPreferenceEnum) => {
    if (guest?.preferences?.sleepPreference === value) {
      setCampingValue(SleepPreferenceEnum.Unknown);
      familyActions.updateFamilyGuestSleepingPreference(guestId, SleepPreferenceEnum.Unknown);
    } else {
      setCampingValue(value);
      familyActions.updateFamilyGuestSleepingPreference(guestId, value);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const calculateShadow = () => {
    const { x, y } = mousePosition.current;
    const shadowX = (x / window.innerWidth) * 10 + 5;
    const shadowY = (y / window.innerHeight) * 10 + 5;
    return `${shadowX}px ${shadowY}px 0px ${darken(theme.palette.primary.dark, 0.85)}`;
  };

  useEffect(() => {
    setCampingValue(guest?.preferences?.sleepPreference || SleepPreferenceEnum.Unknown);
  }, [guest]);

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
    >
      <Paper
        elevation={5}
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.1)',
          filter: `drop-shadow(${calculateShadow()})`,
        }}
      >
        <ButtonGroup
          fullWidth
          orientation={screenWidth > 600 ? 'horizontal' : 'vertical'}
          sx={{
            backgroundColor: 'rgba(0,0,0,.8)',
          }}
        >
          {campingPreferences.slice(1).map((value) => (
            <Button
              size="large"
              disabled={
                familyActions.patchFamilyMutation.isPending ||
                familyActions.getFamilyUnitQuery.isFetching
              }
              color="secondary"
              sx={{ px: value === 'Unknown' ? 0 : 3 }}
              onClick={() => handleChangeSleepPreference(SleepPreferenceEnum[value])}
              variant={
                (campingValue.includes(SleepPreferenceEnum[value])
                  ? 'contained'
                  : 'outlined') as 'contained' | 'outlined'
              }
              key={value}
              startIcon={
                value === 'Camping' ? (
                  <Festival />
                ) : value === 'Hotel' ? (
                  <Apartment />
                ) : value === 'Unknown' ? (
                  ''
                ) : (
                  <HotelOutlined />
                )
              }
            >
              <Box>
                <Box display={'flex'} alignItems={'center'} flexWrap="wrap">
                  <Typography alignContent={'center'} width="100%" fontWeight={'bold'}>
                    {value === 'Unknown' ? '' : value}
                  </Typography>
                </Box>
              </Box>
            </Button>
          ))}
        </ButtonGroup>
      </Paper>
    </Stack>
  );
};

export default CampingPreferences;
