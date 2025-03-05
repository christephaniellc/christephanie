import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestViewModel, RoleEnum, SleepPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup, Chip, Collapse, useTheme } from '@mui/material';
import { 
  Apartment, 
  DirectionsBus, 
  Festival, 
  HotelOutlined, 
  NoTransfer, 
  Home, 
  ExpandMore, 
  ExpandLess,
  Info
} from '@mui/icons-material';
import React, { useEffect } from 'react';
import { Stack } from '@mui/system';
import Paper from '@mui/material/Paper';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import RatingComponent from '@/components/RatingComponent/RatingComponent';
import Tooltip from '@mui/material/Tooltip';

interface HotelOption {
  name: string;
  googleRating: number;
  numberOfRatings: number;
  hotelQuality: number;
  onShuttleRoute: boolean;
  driveMinsFromWedding: number;
  hotelBlock: boolean;
}

const CampingPreferences = ({ guestId }: { guestId: string }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { boxShadow, handleMouseMove } = useBoxShadow();
  const { screenWidth } = useAppLayout();
  const guest: GuestViewModel | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const campingPreferences = Object.keys(SleepPreferenceEnum);
  const theme = useTheme();
  const [campingValue, setCampingValue] = React.useState<SleepPreferenceEnum>(
    SleepPreferenceEnum.Unknown,
  );
  const [takingShuttle, setTakingShuttle] = React.useState(true);
  const [expandedHotel, setExpandedHotel] = React.useState<number | null>(null);
  
  // Check if the guest has the Manor role
  const hasManorRole = React.useMemo(() => {
    return guest?.roles?.includes(RoleEnum.Manor) || false;
  }, [guest?.roles]);

  const handleChangeSleepPreference = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    value: SleepPreferenceEnum,
  ) => {
    if (guest?.preferences?.sleepPreference === value) {
      setCampingValue(SleepPreferenceEnum.Unknown);
      setAnchorEl(null);
      familyActions.updateFamilyGuestSleepingPreference(guestId, SleepPreferenceEnum.Unknown);
    } else {
      setCampingValue(value);
      setAnchorEl(e.currentTarget);
      familyActions.updateFamilyGuestSleepingPreference(guestId, value);
    }
  };

  const handleToggleHotelDetails = (index: number) => {
    setExpandedHotel(expandedHotel === index ? null : index);
  };

  const hotelOptions: HotelOption[] = [
    {
      name: 'Holiday Inn Express Suites - Brunswick, MD',
      googleRating: 4.6,
      numberOfRatings: 195,
      hotelQuality: 3,
      onShuttleRoute: true,
      driveMinsFromWedding: 18,
      hotelBlock: false,
    },
    {
      name: 'Holiday Inn Express Charles Town, Ranson, WV',
      googleRating: 4.5,
      numberOfRatings: 755,
      hotelQuality: 2,
      onShuttleRoute: true,
      driveMinsFromWedding: 23,
      hotelBlock: true,
    },
    {
      name: 'Lovettsville Area Hotels',
      googleRating: 0,
      numberOfRatings: 0,
      hotelQuality: 0,
      onShuttleRoute: false,
      driveMinsFromWedding: 0,
      hotelBlock: false,
    },
  ];

  useEffect(() => {
    setCampingValue(guest?.preferences?.sleepPreference || SleepPreferenceEnum.Unknown);
  }, [guest]);

  const open = Boolean(anchorEl);
  const id = open ? anchorEl?.id : undefined;
  
  const renderHotelDetails = (hotel: HotelOption) => {
    return (
      <Box sx={{ p: 1 }}>
        {hotel.googleRating > 0 && (
          <RatingComponent
            score={hotel.googleRating}
            numberOfRatings={hotel.numberOfRatings}
          />
        )}
        {hotel.onShuttleRoute && (
          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
            (Call & ask for {hotel.hotelBlock ? 'Stubler' : ''} wedding rate)
          </Typography>
        )}
        <Tooltip title={'Take our complimentary shuttle'}>
          <Chip
            id={`shuttle ${takingShuttle}`}
            sx={{
              width: '100%',
              mb: 1,
            }}
            onClick={() => setTakingShuttle(!takingShuttle)}
            icon={
              hotel.onShuttleRoute ? (
                takingShuttle ? <DirectionsBus /> : <NoTransfer />
              ) : (
                <NoTransfer />
              )
            }
            variant={takingShuttle ? 'filled' : ('outlined' as 'filled' | 'outlined')}
            color={
              hotel.onShuttleRoute
                ? takingShuttle
                  ? 'primary'
                  : 'secondary'
                : ('error' as 'primary' | 'secondary' | 'error')
            }
            size="small"
            label={hotel.onShuttleRoute ? 'Shuttle Available' : 'No Shuttle'}
          />
        </Tooltip>
        {hotel.driveMinsFromWedding > 0 && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Drive Time: {hotel.driveMinsFromWedding} mins
          </Typography>
        )}
        <Button 
          variant="outlined"
          color="primary"
          size="small"
          fullWidth
          onClick={() => window.open(`https://www.google.com/search?q=${hotel.name}`)}
          sx={{ mt: 1 }}
        >
          Search on Google
        </Button>
      </Box>
    );
  };

  return (
    <Stack
      display="flex"
      width="100%"
      height="auto"
      my="auto"
      justifyContent="center"
      alignItems="center"
      px={2}
      onMouseMove={handleMouseMove}
      data-testid="camping-preferences-container"
    >
      <Paper
        elevation={5}
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.1)',
          filter: `drop-shadow(${boxShadow})`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 4,
          width: '100%',
        }}
      >
        <ButtonGroup
          fullWidth
          orientation={screenWidth > 600 ? 'horizontal' : 'vertical'}
          sx={{
            backgroundColor: 'rgba(0,0,0,.8)',
          }}
          aria-describedby={id}
        >
          {/* Filter out Manor if user doesn't have Manor role */}
          {campingPreferences.slice(1)
            .filter(value => value !== 'Manor' || hasManorRole)
            .map((value) => (
              <Button
                id={value}
                size="large"
                disabled={
                  familyActions.patchFamilyMutation.isPending ||
                  familyActions.getFamilyUnitQuery.isFetching
                }
                color="secondary"
                sx={{ px: value === 'Unknown' ? 0 : 3 }}
                onClick={(e) => {
                  handleChangeSleepPreference(e, SleepPreferenceEnum[value]);
                }}
                variant={
                  (campingValue.includes(SleepPreferenceEnum[value]) ? 'contained' : 'outlined') as
                    | 'contained'
                    | 'outlined'
                }
                key={value}
                startIcon={
                  value === 'Camping' ? (
                    <Festival />
                  ) : value === 'Hotel' ? (
                    <Apartment />
                  ) : value === 'Manor' ? (
                    <Home />
                  ) : value === 'Unknown' ? (
                    ''
                  ) : (
                    <HotelOutlined />
                  )
                }
              >
                <Box>
                  <Box display={'flex'} alignItems={'center'} flexWrap="wrap" position="relative">
                    <Typography alignContent={'center'} width="100%" fontWeight={'bold'}>
                      {value === 'Unknown' ? '' : value}
                    </Typography>
                  </Box>
                </Box>
              </Button>
            ))}
        </ButtonGroup>
        {campingValue === SleepPreferenceEnum.Camping && (
          <Typography variant="h6" color="secondary" my="auto" width="80%" mx="auto">
            Camp with us at the venue! We have a block of campsites reserved for you and your gear.
          </Typography>
        )}
        {campingValue === SleepPreferenceEnum.Manor && (
          <Typography variant="h6" color="primary" my="auto" width="80%" mx="auto">
            Stay in our Manor House! As a Manor guest, you'll have access to a private room in the historic house.
          </Typography>
        )}
        {campingValue === SleepPreferenceEnum.Hotel && (
          <Stack
            spacing={2}
            sx={{
              p: 2,
              width: '100%',
            }}
            data-testid="hotel-options-container"
          >
            {hotelOptions.map((hotel, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  overflow: 'hidden',
                  backgroundColor: 'rgba(0,0,0,.4)',
                  width: '100%',
                }}
              >
                <Button
                  fullWidth
                  variant="text"
                  color="secondary"
                  onClick={() => handleToggleHotelDetails(index)}
                  sx={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    p: 2,
                    borderRadius: 0,
                  }}
                  endIcon={expandedHotel === index ? <ExpandLess /> : <ExpandMore />}
                  startIcon={<Info />}
                  data-testid={`hotel-button-${index}`}
                >
                  <Typography 
                    component="span" 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold', 
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    {hotel.name}
                  </Typography>
                </Button>
                <Collapse in={expandedHotel === index} timeout="auto" unmountOnExit>
                  {renderHotelDetails(hotel)}
                </Collapse>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
};

export default CampingPreferences;
