import { Box, darken, Slider, SliderThumb, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { AgeGroupEnum, InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { getEnumValueByIndex } from '@/utils/utils';
import Button from '@mui/material/Button';
import { useAuth0 } from '@auth0/auth0-react';
import Stepper from '@mui/material/Stepper';

interface AttendanceButtonProps {
  guestId: string;
}

function AgeGroupThumbComponent(props: React.HTMLAttributes<unknown>) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
    </SliderThumb>
  );
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
  const theme = useTheme();
  const [_, familyActions] = useFamily();
  const { user } = useAuth0();

  const isPending = familyActions.patchFamilyMutation.isPending;
  const darkenCoefficent = isPending ? .5 : 0;

  useEffect(() => {
    if (guest?.ageGroup) {
      setUserAgeGroup(guest.ageGroup);
    }
  }, [guest]);

  const isMe = useMemo(() => guest.auth0Id === user?.sub, [guest, user]);

  const setUserAge = (guestId: string, ageGroup: AgeGroupEnum) => {
    setUserAgeGroup(Object.values(AgeGroupEnum)[ageGroup]);
  };

  useEffect(() => {
    if (guest && guest.ageGroup) setUserAgeGroup(guest.ageGroup);
  }, [guest, familyActions.updateFamilyGuestAgeGroup]);

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
        return { color: 'default', fontSize: 'medium', border: `2px solid ${theme.palette.info.main}` };
    }
  }, [userAgeGroupIndex, theme.palette.primary.main, theme.palette.secondary.main, darkenCoefficent]);

  const imgButtonSxProps = useMemo(() => {
    return {
      fontSize: buttonProps.fontSize,
      color: darken(theme.palette.text.primary, darkenCoefficent),
      pointerEvents: 'none',
    };
  }, [buttonProps.fontSize, buttonProps.border, theme.palette.text.primary, darkenCoefficent]);

  const disabled = useMemo(() => familyActions.patchFamilyMutation.isPending || familyActions.getFamilyUnitQuery.isFetching, [familyActions.patchFamilyMutation.isPending, familyActions.getFamilyUnitQuery.isFetching]);

  return (
    <Box display="flex"
         flexWrap="nowrap"
         sx={{
           backdropFilter: 'none',
           backgroundColor: 'transparent',
           boxShadow: 'none',
         }}>
      <Button
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: theme.spacing(2),
          position: 'relative',
          width: 150,
          minWidth: 150,
          maxWidth: 150,
          height: 175,
          ...imgButtonSxProps,
          boxShadow: 'none',
          backgroundColor: 'transparent',
        }}
      >
        <Box
          sx={{
            fontSize: buttonProps.fontSize,
            color: darken(theme.palette.text.primary, darkenCoefficent),
            position: 'relative',
            marginBottom: theme.spacing(2),
            mx: theme.spacing(1),
            display: 'flex',
            flexDirection: 'column',
            px: 2,
            width: '100%',
            height: '100%',
          }}
        >
          <Typography variant="caption" mr={'auto'}>And {isMe ? 'You\'re' : 'They\'re'}</Typography>
          <AgeSlider
            sx={{ pointerEvents: disabled ? 'none' : 'auto', mt: 3 }}
            track="inverted"
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
            onChangeCommitted={(_event, value) => familyActions.updateFamilyGuestAgeGroup(guestId, value as number as unknown as AgeGroupEnum)}
          />
        </Box>
      </Button>
    </Box>
  );
};

export const AgeSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-track': {
    background: 'linear-gradient(to top, transparent 0%, transparent 80%, black 100%)',
    width: '20px',
    transform: 'translateX(-50%)',
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'transparent',
  },
  '& .MuiSlider-thumb': {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
    },
    '&:disabled': {
      backgroundColor: 'rgba(0, 0, 0, 0.26)',
    },
  },
  '& .MuiSlider-thumb svg': {
    color: 'white',
  },
  '& .MuiSlider-mark': {
    display: 'none',
  },
  ...theme.applyStyles('dark', {}),
}));