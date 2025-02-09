import { Box, darken, Slider, SliderThumb, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { AgeGroupEnum, InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import Button from '@mui/material/Button';
import { getEnumValueByIndex } from '@/utils/utils';

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


export const AgeSelector = ({ guestId }: AttendanceButtonProps) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const [userAgeGroup, setUserAgeGroup] = useState(guest?.ageGroup || AgeGroupEnum.Adult);
  const theme = useTheme();
  const [_, familyActions] = useFamily();

  const isPending = familyActions.updateFamilyMutation.isPending;
  const darkenCoefficent = isPending ? .5 : 0;

  useEffect(() => {
    if (guest?.ageGroup) {
      setUserAgeGroup(guest.ageGroup);
    }
  }, [guest]);
  const setUserAge = (guestId: string, ageGroup: AgeGroupEnum) => {
    console.log('ageGroup', ageGroup);
    console.log(Object.values(AgeGroupEnum)[ageGroup]);
    setUserAgeGroup(Object.values(AgeGroupEnum)[ageGroup]);
  };

  useEffect(() => {
    setUserAgeGroup(guest?.ageGroup || AgeGroupEnum.Adult);
  }, [guest, familyActions.updateFamilyGuestAgeGroup]);

  const userAgeGroupIndex = useMemo(() => {
    return Object.values(AgeGroupEnum).indexOf(userAgeGroup);
  }, [userAgeGroup]);

  const marks = [
    { label: 'Adult', value: 3 },
    { label: 'Under 21', value: 2 },
    { label: 'Under 13', value: 1 },
    { label: 'Baby', value: 0 },
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

  // todo: move these to an age selector component
  // const [ageGroup, setAgeGroup] = useState<AgeGroupEnum>(AgeGroupEnum.Adult);
  // const toSliderValue = (ageGroup: AgeGroupEnum) => Object.values(AgeGroupEnum).indexOf(ageGroup);
  // const toAgeGroup = useCallback((value: number) => Object.values(AgeGroupEnum)[value] as AgeGroupEnum, []);

  const imgButtonSxProps = useMemo(() => {
    return {
      fontSize: buttonProps.fontSize,
      color: darken(theme.palette.text.primary, darkenCoefficent),
      pointerEvents: 'none',
    };
  }, [buttonProps.fontSize, buttonProps.border, theme.palette.text.primary, darkenCoefficent]);

  return (
    <Box display="flex"
         flexWrap="nowrap"
         sx={{
           backdropFilter: 'blur(8px)',
           backgroundColor: 'rgba(0,0,0,0.5)',
         }}>
      <Button
        sx={{
          '&:hover': {
            boxShadow: 3,
          },
          '&:hover, &.Mui-focusVisible': {
            zIndex: 1,
            '& .MuiImageBackdrop-root': {
              opacity: 0.15,
            },
            '& .MuiImageMarked-root': {
              opacity: 0,
            },
            '& .MuiTypography-root': {
              // border: '4px solid currentColor',
            },
          },
          alignItems: 'flex-start',
          boxShadow: 1,
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
        }}

      >
        <Box
          sx={{
            fontSize: buttonProps.fontSize,
            // border: buttonProps.border,
            color: darken(theme.palette.text.primary, darkenCoefficent),
            // borderRadius: 16,
            boxShadow: 1,
            '&:hover': {
              boxShadow: 3,
            },
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
          <Typography variant="caption" mr={'auto'}>Age</Typography>
          <AgeSlider
            sx={{ pointerEvents: 'auto', mt: 3 }}
            track="inverted"
            disabled={familyActions.updateFamilyMutation.isPending}
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
      {/*<Box alignContent="center"*/}
      {/*     sx={{ imgButtonSxProps, borderWidth: 2 }}*/}
      {/*>*/}
      {/*  {ageIcons[userAgeGroupIndex]}*/}
      {/*</Box>*/}
    </Box>
  );
};



export const CountdownMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 700,
  fontSize: '1.5rem',
  [theme.breakpoints.up('sm')]: {},
}));

export const AgeSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-track': {
    border: 'none',
    backgroundColor: 'transparent',
  },
  '& .MuiSlider-rail': {
    // borderBottom: `2px dotted ${theme.palette.secondary.main}`,
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
  },
  '& .MuiSlider-thumb svg': {
    color: 'white',
  },
  ...theme.applyStyles('dark', {
    // color: '#0a84ff',
  }),
}));