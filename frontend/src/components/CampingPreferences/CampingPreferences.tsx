import React from 'react';
import { Stack, Paper, Box, Typography, alpha, useTheme, Button, useMediaQuery } from '@mui/material';
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
import { is } from '@react-spring/shared';

const CampingPreferences: React.FC<CampingPreferencesProps> = ({ 
  guestId, guestFirstName }) => {
  const { boxShadow, handleMouseMove } = useBoxShadow();
  const theme = useTheme();
  const { screenWidth } = useAppLayout();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        <Box sx={{ 
          p: 2, 
          pb: 1, 
          width: '100%',
          background: alpha(theme.palette.background.paper, 0.9),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` 
        }}>
          {/* For Mobile View - Stacked Layout */}
          {isMobile && (
            <>
              <Box sx={{ width: '100%', mb: 2 }}>
                <StephsActualFavoriteTypographyNoDrop 
                  variant="h6" 
                  fontWeight="500"
                  id="camping-preferences-heading-mobile"
                  sx={{
                    color: '#FFFFFF',
                    display: 'block',
                    mb: 1.5
                  }}
                >
                  {guestFirstName}
                </StephsActualFavoriteTypographyNoDrop>
                
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<OpenInNew />}
                  fullWidth
                  sx={{ 
                    display: 'block',
                    fontSize: '0.8rem',
                    mt: 0.5
                  }}
                  onClick={() => window.open(`details/accommodations`)}
                >
                  Accommodation Details
                </Button>
              </Box>
            </>
          )}
          
          {/* For Desktop View - Side by Side Layout */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <StephsActualFavoriteTypographyNoDrop 
                variant="h6" 
                fontWeight="500"
                id="camping-preferences-heading-desktop"
                sx={{
                  color: '#FFFFFF'
                }}
              >
                {guestFirstName}
              </StephsActualFavoriteTypographyNoDrop>
              
              <Button
                variant="contained"
                color="primary"
                endIcon={<OpenInNew />}
                sx={{ 
                  ml: 2,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => window.open(`details/accommodations`)}
              >
                Click for Accommodation Details
              </Button>
            </Box>
          )}
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