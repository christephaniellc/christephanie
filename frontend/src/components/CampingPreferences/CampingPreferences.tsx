import React from 'react';
import { Stack, Paper, Box, Typography, alpha, useTheme, Button } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { CampingPreferencesProps } from './types';
import { useCampingPreferences } from './hooks';
import { 
  PreferenceButtonGroup, 
  PreferenceDescription 
} from './components';
import theme from '@/store/theme'; 
import {StephsActualFavoriteTypographyNoDrop} from '@/components/AttendanceButton/AttendanceButton';
import { OpenInNew } from '@mui/icons-material';

const CampingPreferences: React.FC<CampingPreferencesProps> = ({ 
  guestId, guestFirstName }) => {
  const { boxShadow, handleMouseMove } = useBoxShadow();
  const theme = useTheme();
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
          width: '100%',
          overflow: 'hidden',
        }}
      >   
        <Box sx={{ p: 2, 
          pb: 1, 
          width: '100%',
          display: 'flex',
          //border: `1px solid ${theme.palette.primary.main}`,
          background: alpha(theme.palette.background.paper, 0.9),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` 
        }}>
          <StephsActualFavoriteTypographyNoDrop 
            variant="h6" 
            fontWeight="500" 
            color="white"
            id="camping-preferences-heading"
            sx={{
              color: '#FFFFFF', 
            }}
          >
            {guestFirstName}
          </StephsActualFavoriteTypographyNoDrop>
          <Button
              variant="contained"
              color="primary"
              endIcon={<OpenInNew />}
              sx={{ 
                mt: 1, 
                align: 'flex-end',
                //alignSelf: 'flex-end',
                mb: 2,
                ml: 2
                }}
              onClick={() => window.open(`details/accommodations`)}
            >
            Click for Accommodation Details
          </Button>
        </Box>    
        {/* Selection buttons */}
        <PreferenceButtonGroup
          campingPreferences={campingPreferences}
          campingValue={campingValue}
          hasManorRole={hasManorRole}
          screenWidth={screenWidth}
          handleChangeSleepPreference={handleChangeSleepPreference}
          isPending={isPending}
          isFetching={isFetching}
        />
        
        {/* Description based on selection */}
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