import React from 'react';
import { ButtonGroup, Button, Box, Typography, useTheme } from '@mui/material';
import { Festival, Apartment, Home, HotelOutlined } from '@mui/icons-material';
import { SleepPreferenceEnum } from '@/types/api';
import { PreferenceButtonGroupProps } from '../types';

const PreferenceButtonGroup: React.FC<PreferenceButtonGroupProps> = ({
  campingPreferences,
  campingValue,
  hasManorRole,
  screenWidth,
  handleChangeSleepPreference,
  isPending,
  isFetching,
}) => {
  const theme = useTheme();
  const getIcon = (value: string) => {
    switch (value) {
      case 'Camping':
        return <Festival />;
      case 'Hotel':
        return <Apartment />;
      case 'Manor':
        return <Home />;
      case 'Unknown':
        return '';
      default:
        return <HotelOutlined />;
    }
  };

  return (
    <ButtonGroup
      fullWidth
      orientation="vertical"
      sx={{
        backgroundColor: 'rgba(0,0,0,.8)',
        '& .MuiButtonGroup-grouped': {
          borderRadius: 0
        },
        // Use mobile-first approach with theme.breakpoints.up
        [`${theme.breakpoints.up('md')}`]: {
          flexDirection: 'row'
        }
      }}
    >
      {/* Filter out Manor if user doesn't have Manor role */}
      {campingPreferences
        .slice(1)
        .filter((value) => value !== 'Manor' || hasManorRole)
        .map((value) => (
          <Button
            id={value}
            size="large"
            disabled={isPending || isFetching}
            color="secondary"
            sx={{ px: value === 'Unknown' ? 0 : 3 }}
            onClick={(e) => {
              handleChangeSleepPreference(e, SleepPreferenceEnum[value]);
            }}
            variant={
              campingValue.includes(SleepPreferenceEnum[value])
                ? 'contained'
                : 'outlined'
            }
            key={value}
            startIcon={getIcon(value)}
            data-testid={`preference-button-${value}`}
          >
            <Box>
              <Box
                display={'flex'}
                alignItems={'center'}
                flexWrap="wrap"
                position="relative"
              >
                <Typography 
                  alignContent={'center'} 
                  width="100%" 
                  fontWeight={'bold'}
                  sx={{ textOverflow: 'unset', overflowWrap: 'break-word' }}
                >
                  {value === 'Unknown' ? '' : `${value}${value === 'Manor'? '*' : ''}`}
                </Typography>
              </Box>
            </Box>
          </Button>
        ))}
    </ButtonGroup>
  );
};

export default PreferenceButtonGroup;