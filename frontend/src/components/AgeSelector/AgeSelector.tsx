import { Box, ButtonBase, darken, Slider, SliderThumb, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { AgeGroupEnum, GuestDto, InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { BabyChangingStation, Boy, Celebration, ChildCare, Face6, Liquor } from '@mui/icons-material';
import StickFigureIcon from '@/components/StickFigureIcon';

interface AttendanceButtonProps {
  guestId: string;
}

interface AgeSliderThumbProps extends React.HTMLAttributes<unknown> {
}

function AgeGroupThumbComponent(props: AgeSliderThumbProps) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
    </SliderThumb>
  );
}

const ageIcons = [
  <Box display={'flex'} alignItems={'flexStart'} key={AgeGroupEnum.Adult}><Liquor
    sx={{ fontSize: 18 }} /><StickFigureIcon rotation={0} fontSize={'large'} /></Box>,         // 0 -> Adult
  <StickFigureIcon rotation={0} fontSize={'large'} key={AgeGroupEnum.Under21} />,               // 1 -> Under21
  <StickFigureIcon rotation={0} fontSize={'small'} key={AgeGroupEnum.Under13} />,           // 2 -> Under13
  <BabyChangingStation key={AgeGroupEnum.Baby} />, // 3 -> Baby
];


export const AgeSelector = ({ guestId }: AttendanceButtonProps) => {
  const guest: GuestDto | null = useRecoilValue(guestSelector(guestId));
  const [userAgeGroup, setUserAgeGroup] = useState(guest?.ageGroup || AgeGroupEnum.Adult);
  const theme = useTheme();
  const [_, familyActions] = useFamily();

  const isPending = familyActions.updateFamilyMutation.isPending;
  const darkenCoefficent = isPending ? .5 : 0;

  const setUserAge = (guestId: string, ageGroup: AgeGroupEnum) => {
    console.log('ageGroup', ageGroup);
    console.log(Object.values(AgeGroupEnum)[ageGroup]);
    setUserAgeGroup(Object.values(AgeGroupEnum)[ageGroup]);

    // familyActions.updateFamilyGuestAgeGroup(guestId, ageGroup);
  };

  useEffect(() => {
    setUserAgeGroup(guest?.ageGroup || AgeGroupEnum.Adult);
  }, [guest]);

  const userAgeGroupIndex = useMemo(() => {
    return Object.values(AgeGroupEnum).indexOf(userAgeGroup);
  }, [userAgeGroup]);

  const marks = [
    { label: 'Adult', value: 0 },
    { label: 'Under 21', value: 1 },
    { label: 'Under 13', value: 2 },
    { label: 'Baby in Arms', value: 3 },
  ];


  const buttonProps = useMemo(() => {
    switch (userAgeGroupIndex) {
      case InvitationResponseEnum['Interested']:
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
      border: buttonProps.border,
      color: darken(theme.palette.text.primary, darkenCoefficent),
      pointerEvents: 'none',
    };
  }, [buttonProps.fontSize, buttonProps.border, theme.palette.text.primary, darkenCoefficent]);

  return (
    <Box display="flex"
         flexWrap="no-wrap"
         sx={{
           backdropFilter: 'blur(8px)',
           backgroundColor: 'rgba(0,0,0,0.5)',
         }}>
      <ImageButton
        sx={imgButtonSxProps}

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
          <Typography variant="caption">Age</Typography>
          <AgeSlider
            sx={{ pointerEvents: 'auto' }}
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
            slotProps={{
              thumb: {
                children: ageIcons[userAgeGroupIndex],
              },
            }}
            onChange={(_, value) => setUserAge(guestId, value as number)}
            onChangeCommitted={(_, index) => familyActions.updateFamilyGuestAgeGroup(guestId, Object.values(AgeGroupEnum)[index])}
          />
        </Box>
      </ImageButton>
      <Box alignContent="center"
           sx={{ imgButtonSxProps, borderWidth: 2 }}
      >
        {ageIcons[userAgeGroupIndex]}
      </Box>
    </Box>
  );
};


const ImageButton = styled(ButtonBase)(({ theme }) => ({
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
  width: 175,
  minWidth: 175,
  maxWidth: 175,
  height: 175,

  [theme.breakpoints.up('sm')]: {
    width: 250,
    minWidth: 250,
    maxWidth: 250,
  },
}));

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
    color: '#0a84ff',
  }),
}));