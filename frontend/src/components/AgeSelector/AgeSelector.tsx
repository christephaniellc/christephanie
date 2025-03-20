import { Box, darken, Slider, SliderThumb, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { AgeGroupEnum, InvitationResponseEnum } from '@/types/api';
import { useRecoilState, useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { getEnumValueByIndex } from '@/utils/utils';
import Button from '@mui/material/Button';
import { useAuth0 } from '@auth0/auth0-react';
import Stepper from '@mui/material/Stepper';
import { saveTheDateStepsState, stdStepperState } from '@/store/steppers/steppers';
import Paper from '@mui/material/Paper';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';

interface AttendanceButtonProps {
  guestId: string;
}

function AgeGroupThumbComponent(props: React.HTMLAttributes<unknown>) {
  const { children, ...other } = props;
  return <SliderThumb {...other}>{children}</SliderThumb>;
}

const CustomStepper = styled(Stepper)(({ theme }) => ({
  position: 'relative',
  '& .MuiStepConnector-lineVertical': {
    borderLeft: 'none',
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: '20px',
    background: 'linear-gradient(to top, transparent 0%, transparent 80%, black 100%)',
    transform: 'translateX(-50%)',
  },
}));

export const AgeSelector = ({ guestId }: AttendanceButtonProps) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const [userAgeGroup, setUserAgeGroup] = useState(guest.ageGroup);
  const { boxShadow } = useBoxShadow();
  const theme = useTheme();
  const [_, familyActions] = useFamily();
  const { user } = useAuth0();
  const stdStepper = useRecoilValue(stdStepperState);
  const { currentStep } = stdStepper;

  const [stdSteps, setStdSteps] = useRecoilState(saveTheDateStepsState);

  const isPending = familyActions.patchFamilyMutation.isPending;
  const darkenCoefficent = isPending ? 0.5 : 0;

  useEffect(() => {
    if (guest?.ageGroup) {
      setUserAgeGroup(guest.ageGroup);
    }
  }, [guest]);

  const isMe = useMemo(() => guest.auth0Id === user?.sub, [guest, user]);

  const setUserAge = (guestId: string, ageGroup: AgeGroupEnum) => {
    setUserAgeGroup(Object.values(AgeGroupEnum)[ageGroup]);
  };

  const userAgeGroupIndex = useMemo(() => {
    return Object.values(AgeGroupEnum).indexOf(userAgeGroup);
  }, [userAgeGroup]);

  const marks = [
    { label: 'Adulting', value: 3 },
    { label: 'Under 21', value: 2 },
    { label: 'Under 13', value: 1 },
    { label: 'A Baby', value: 0 },
  ];

  const buttonProps = useMemo(() => {
    switch (getEnumValueByIndex(InvitationResponseEnum, userAgeGroupIndex)) {
      case InvitationResponseEnum.Interested:
        return {
          color: 'primary',
          fontSize: 'large',
          border: `2px solid ${darken(theme.palette.primary.main, darkenCoefficent)}`,
        };
      case InvitationResponseEnum.Declined:
        return {
          color: 'error',
          fontSize: 'small',
          border: `2px dashed ${darken(theme.palette.error.main, darkenCoefficent)}`,
        };
      case InvitationResponseEnum.Pending:
        return {
          color: 'default',
          fontSize: 'medium',
          border: `2px solid ${darken(theme.palette.secondary.main, darkenCoefficent)}`,
        };
      default:
        return {
          color: 'default',
          fontSize: 'medium',
          border: `2px solid ${theme.palette.info.main}`,
        };
    }
  }, [
    userAgeGroupIndex,
    theme.palette.primary.main,
    theme.palette.secondary.main,
    darkenCoefficent,
  ]);

  const imgButtonSxProps = useMemo(() => {
    return {
      fontSize: buttonProps.fontSize,
      color: darken(theme.palette.text.primary, darkenCoefficent),
      pointerEvents: 'none',
    };
  }, [buttonProps.fontSize, buttonProps.border, theme.palette.text.primary, darkenCoefficent]);

  useEffect(() => {}, []);

  const disabled = useMemo(
    () =>
      familyActions.patchFamilyMutation.isPending || familyActions.getFamilyUnitQuery.isFetching,
    [familyActions.patchFamilyMutation.isPending, familyActions.getFamilyUnitQuery.isFetching],
  );

  return (
    <Box
      display="flex"
      flexWrap='wrap'
      sx={{
        p: 2,
        height: '100%',
        overflow: 'hidden',
        border: `2px solid rgba(${theme.palette.secondary.main}, .5)`,
        alignContent: 'space-between',
        backdropFilter: 'none',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        width: { xs: '100%', sm: 200 }, // Full width on mobile, 200px on larger screens
        mx: 'auto', // Center the component horizontally
        maxWidth: '250px', // Set a maximum width to prevent it from getting too wide
      }}
    >
      <StephsActualFavoriteTypographyNoDrop 
        variant="body1" 
        width={'100%'} 
        color='secondary' 
        sx={{ 
          textAlign: 'center',
          lineHeight: '2.5rem'
         }}
      >
        {guest.firstName} is...
      </StephsActualFavoriteTypographyNoDrop>
      <Button
        component={Paper}
        elevation={10}
        sx={{
          ...imgButtonSxProps,
          my: 2,
          alignItems: 'center',
          pt: 5,
          pb: 3,
          pr: 6,
          pl: 4,
          mx: 'auto', // Center horizontally
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          width: { xs: '180px', sm: 150 }, // Wider on mobile
          minWidth: { xs: '180px', sm: 150 }, // Wider on mobile
          maxWidth: { xs: '180px', sm: 150 }, // Wider on mobile
          boxShadow: boxShadow,
          backgroundColor: 'transparent',
          flexGrow: 2,
          height: 135,
        }}
      >
        <Box
          sx={{

            fontSize: buttonProps.fontSize,
            color: darken(theme.palette.text.primary, darkenCoefficent),
            position: 'relative',
            marginBottom: theme.spacing(2),
            display: 'flex',
            width: '100%',
            height: '100%',
            paddingRight: theme.spacing(12),
          }}
        >
          <AgeSlider
            sx={{ pointerEvents: disabled ? 'none' : 'auto' }}
            // track="inverted"
            disabled={disabled}
            orientation="vertical"
            defaultValue={0}
            max={3}
            min={0}
            value={userAgeGroupIndex}
            marks={marks}
            slots={{
              thumb: AgeGroupThumbComponent,
            }}
            onChange={(_, value) => setUserAge(guestId, value as number as unknown as AgeGroupEnum)}
            onChangeCommitted={(_event, value) =>
              familyActions.updateFamilyGuestAgeGroup(
                guestId,
                value as number as unknown as AgeGroupEnum,
              )
            }
          />
        </Box>
      </Button>
    </Box>
  );
};

export const AgeSlider = styled(Slider)(({ theme }) => ({
  ...theme.applyStyles('dark', {}),
  '& .MuiSlider-track': {
    background: `linear-gradient(to bottom, ${theme.palette.secondary.dark} 0%, transparent 80%, black 100%)`,
    width: '20px',
    transform: 'translateX(-50%)',
    height: '100% !important',
    border: `1px solid ${theme.palette.secondary.main}`,
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'transparent',
  },
  '& .MuiSlider-thumb': {
    height: 27,
    width: 27,
    backgroundColor: `rgba(255, 255, 255,.98)`,
    backdropFilter: 'blur(80)',
    border: `1px solid ${theme.palette.secondary.main}`,
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
    },
    '&:disabled': {
      backgroundColor: 'rgba(0, 0, 0, 0.26)',
    },
  },
  '& .MuiSlider-thumb svg': {
    // color: 'white',
  },
  '& .MuiSlider-mark': {
    display: 'none',
  },
  '& .MuiSlider-markLabel': {
    color: theme.palette.grey.A700,
    fontWeight: 'bold',
    '&.MuiSlider-markLabelActive': {
      color: theme.palette.secondary.main,
    },
  },


}));
