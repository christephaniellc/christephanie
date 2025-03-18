import { styled, Typography } from '@mui/material';
import { rgba } from 'polished';

export const StephsFavoriteTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 700,
  fontSize: '1.5rem',
  [theme.breakpoints.up('sm')]: {},
}));

export const StephsActualFavoriteTypography = styled(Typography)(({ theme }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: rgba(255, 255, 255, 0.98),
  textShadow: '3px 3px 0 #E9950C',
  fontWeight: 300,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '1.5rem',
  lineHeight: '2.5rem',
}));

export const StephsActualFavoriteTypographyAppVersion = styled(Typography)(({ theme }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: rgba(255, 255, 255, 0.98),
  textShadow: '2px 2px 0 #E9950C',
  fontWeight: 300,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '1.5rem',
  lineHeight: '2.5rem',
}));

export const BlockTextTypographyLess = styled(Typography)(({ theme }) => ({
  textShadow: '1px 1px 0 #000000, -1px -1px 0 #000000, 0px 1px 0 #000000, 0px -1px 0 #000000, 1px 0px 0 #000000, -1px 0px 0 #000000, -1px 1px 0 #000000, 1px -1px 0 #000000',
}));

interface BlockTextTypographyProps {
  shadowcolor: string;
  maxpx: number;
}

export const BlockTextTypography = styled(Typography)<BlockTextTypographyProps>(({ theme, shadowcolor = '#000000', maxpx = '2'}) => ({
    textShadow: `
      ${maxpx}px ${maxpx}px 0 ${shadowcolor}, 
      -${maxpx}px -${maxpx}px 0 ${shadowcolor}, 
      ${maxpx}px 0px 0 ${shadowcolor}, 
      -${maxpx}px -0px 0 ${shadowcolor}, 
      0px ${maxpx}px 0 ${shadowcolor}, 
      0px -${maxpx}px 0 ${shadowcolor},
      -${maxpx}px ${maxpx}px 0 ${shadowcolor}, 
      ${maxpx}px -${maxpx}px 0 ${shadowcolor}, 
      1px 1px 0 ${shadowcolor}, 
      -1px -1px 0 ${shadowcolor}, 
      0px 1px 0 ${shadowcolor}, 
      0px -1px 0 ${shadowcolor}, 
      1px 0px 0 ${shadowcolor}, 
      -1px 0px 0 ${shadowcolor}, 
      -1px 1px 0 ${shadowcolor},
      1px -1px 0 ${shadowcolor}
    `,
}));

export const Text3dTypography = styled(Typography)(({ theme }) => ({  
  textShadow: '-2px -2px 0 #000000, -1px -1px 0 #000000'
}));