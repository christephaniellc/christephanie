import React from 'react';
import { Stack, Paper } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { CampingPreferencesProps } from './types';
import { useCampingPreferences } from './hooks';
import { 
  PreferenceButtonGroup, 
  PreferenceDescription 
} from './components';

const CampingPreferences: React.FC<CampingPreferencesProps> = ({ guestId }) => {
  const { boxShadow, handleMouseMove } = useBoxShadow();
  const { screenWidth } = useAppLayout();
  const {
    campingPreferences,
    campingValue,
    hasManorRole,
    hotelOptions,
    expandedHotel,
    takingShuttle,
    setTakingShuttle,
    handleChangeSleepPreference,
    handleToggleHotelDetails,
    isPending,
    isFetching,
    popoverId,
  } = useCampingPreferences(guestId);

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
        <PreferenceButtonGroup
          campingPreferences={campingPreferences}
          campingValue={campingValue}
          hasManorRole={hasManorRole}
          screenWidth={screenWidth}
          handleChangeSleepPreference={handleChangeSleepPreference}
          isPending={isPending}
          isFetching={isFetching}
        />
        
        <PreferenceDescription
          campingValue={campingValue}
          hotelOptions={hotelOptions}
          expandedHotel={expandedHotel}
          handleToggleHotelDetails={handleToggleHotelDetails}
          takingShuttle={takingShuttle}
          setTakingShuttle={setTakingShuttle}
        />
      </Paper>
    </Stack>
  );
};

export default CampingPreferences;