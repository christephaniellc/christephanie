import React from 'react';
import { Button, ButtonGroup, Box, Chip, Typography, darken, useTheme } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import { FoodAllergyIconProps } from '@/components/Allergies';
import { useFamily, guestSelector } from '@/store/family';
import { useRecoilValue } from 'recoil';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

interface AllergyButtonGroupProps {
  guestId: string;
  chosenAllergies: string[];
  activeEatingIcon: React.ReactNode;
  resetAllergies: () => void;
  allergyIconProps: FoodAllergyIconProps[];
  setModalOpen: (open: boolean) => void;
}

const AllergyButtonGroup: React.FC<AllergyButtonGroupProps> = ({
  guestId,
  chosenAllergies,
  activeEatingIcon,
  resetAllergies,
  allergyIconProps,
  setModalOpen,
}) => {
  const theme = useTheme();
  const { screenWidth } = useAppLayout();
  const [_, familyActions] = useFamily();

  const isBreakpointUpMin = screenWidth > theme.breakpoints.values.md;

  return (
    <ButtonGroup
      fullWidth
      orientation={isBreakpointUpMin ? 'horizontal' : 'vertical'}
      sx={{
        backgroundColor: 'rgba(0,0,0,.8)',
        height: '100%',
        '& .MuiButtonGroup-grouped': {
          borderRadius: 0,
        },
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Button
        id="no-allergies-button"
        color="secondary"
        variant={(chosenAllergies?.length === 0 || !chosenAllergies || chosenAllergies.join('') === 'none') ? 'contained' : 'outlined'}
        sx={{
          lineHeight: 1.2,
          justifyContent: 'flex-start',
          paddingY: 1.5,
          paddingX: 2,
          width: isBreakpointUpMin ? '33.33%' : '100%',
          height: !isBreakpointUpMin ? '30%' : '100%',
        }}
        onClick={() => resetAllergies()}
        disabled={
          familyActions.patchFamilyGuestMutation.status === 'pending' ||
          familyActions.getFamilyUnitQuery.isFetching
        }
      >
        <Box
          sx={{
            width: '100%',
            padding: 4,
          }}
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <>{activeEatingIcon}</>
          <Typography>I can eat anything</Typography>
        </Box>
      </Button>

      <Button
        variant={(chosenAllergies && chosenAllergies.length > 0 && chosenAllergies.join('') !== 'none') ? 'contained' : 'outlined'}
        color="warning"
        sx={{
          width: isBreakpointUpMin ? '66.66%' : '100%',
          height: !isBreakpointUpMin ? '70%' : '100%',
          lineHeight: 1.2,
          paddingY: 1.5,
          paddingX: 2,
        }}
        onClick={() => setModalOpen(true)}
        disabled={
          familyActions.patchFamilyGuestMutation.status === 'pending' ||
          familyActions.getFamilyUnitQuery.isFetching
        }
      >
        {(!chosenAllergies || chosenAllergies.length === 0 || chosenAllergies.join('') === 'none') ? (
          <Typography sx={{ mx: 'auto' }}>I'm allergic to stuff</Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              width: '100%',
              justifyContent: 'space-around',
              height: '100%',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mx="auto">
              <WarningAmber />
              <Typography>I'm allergic to</Typography>
            </Box>
            <Box width="100%" display="flex" flexWrap="wrap" justifyContent="center" gap={0.5}>
              {chosenAllergies.map((allergy) => {
                if (allergy === 'none') return null;
                // Find the allergy data in our allergyIconProps list
                const allergyData = allergyIconProps.find((a) => a.allergyName === allergy);
                
                // Render the allergy chip, even if we don't have predefined data for it
                return (
                  <Chip
                    key={allergy}
                    label={allergy}
                    size="small"
                    icon={allergyData ? <allergyData.icon fontSize="small" /> : undefined}
                    sx={{
                      m: 0.25,
                      backgroundColor: darken(theme.palette.error.dark, 0.6),
                      backdropFilter: 'blur(5px)',
                      border: `2px solid ${theme.palette.error.dark}`,
                      boxShadow: `0 0 0 3px ${darken(theme.palette.error.dark, 6)}`,
                      color: theme.palette.error.main,
                      transition: 'all 0.2s ease',
                      '& .MuiChip-icon': {
                        color: theme.palette.error.main,
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </Button>
    </ButtonGroup>
  );
};

export default AllergyButtonGroup;
