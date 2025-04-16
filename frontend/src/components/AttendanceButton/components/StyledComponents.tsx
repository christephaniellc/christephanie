import { styled, Typography, TypographyProps } from '@mui/material';
import { rgba } from 'polished';
import { keyframes, darken, TypographyProps } from '@mui/system';

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

export const StephsFavoriteTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 700,
  fontSize: '1.5rem',
  [theme.breakpoints.up('sm')]: {},
}));

export const StephsActualFavoriteTypography = styled(Typography)(({ theme }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: rgba(255, 255, 255, 0.98),
  textShadow: `3px 3px 0 ${theme.palette.primary.main}`,
  fontWeight: 300,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '1.5rem',
  lineHeight: '2.5rem',
  animation: `${floatAnimation} 3s infinite ease-in-out`,
}));

export const StephsActualFavoriteTypographyNoDropWhite = styled(Typography)(({ theme }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: rgba(255, 255, 255, 0.98),
  textShadow: `3px 3px 0 ${theme.palette.primary.main}`,
  fontWeight: 300,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '1.5rem',
  lineHeight: '2.5rem',
}));

export const StephsActualFavoriteTypographyNoDrop = styled(Typography)(({ theme }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: theme.palette.secondary.main,
  fontWeight: 300,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '1.3rem',
  lineHeight: '2.5rem',
  textShadow: `3px 3px 0 ${darken(theme.palette.secondary.dark, 0.5)}`,
}));

interface CustomTypographyProps extends TypographyProps {
  color?: string;
}

export const StephsActualFavoriteTypographyStyleDrop = styled(
  Typography,
  {
    shouldForwardProp: (prop) => prop !== 'color', // prevent passing it to the DOM
  }
)<CustomTypographyProps>(({ theme, color }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: theme.palette.secondary.main,
  fontWeight: 300,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '1.3rem',
  lineHeight: '2.5rem',
  textShadow: `3px 3px 0 ${color ?? theme.palette.secondary.dark}`,
}));

export const StephsActualFavoriteTypographyBackNext = styled(Typography)(({ theme }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: rgba(255, 255, 255, 0.98),
  textShadow: `3px 3px 0 ${theme.palette.primary.main}`,
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

// New configurable typography component
interface StephsStyledTypographyProps {
  textColor?: string;
  shadowColor?: string;
  shadowSize?: number;
  fontSize?: string;
  animate?: boolean;
  usePrimaryColor?: boolean;
  useSecondaryColor?: boolean;
  useWhite?: boolean;
}

export const StephsStyledTypography = styled(Typography)<StephsStyledTypographyProps & TypographyProps>(
  ({ 
    theme, 
    textColor, 
    shadowColor, 
    shadowSize = 3,
    fontSize = '1.5rem',
    animate = false,
    usePrimaryColor = false,
    useSecondaryColor = false,
    useWhite = true
  }) => ({
    fontFamily: 'Snowstorm, sans-serif',
    color: textColor || 
           (useSecondaryColor ? theme.palette.secondary.main : 
            useWhite ? rgba(255, 255, 255, 0.98) : 
            usePrimaryColor ? theme.palette.primary.main : rgba(255, 255, 255, 0.98)),
    textShadow: `${shadowSize}px ${shadowSize}px 0 ${
      shadowColor || 
      (useSecondaryColor ? darken(theme.palette.secondary.dark, 0.5) : theme.palette.primary.main)
    }`,
    fontWeight: 300,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontSize: fontSize,
    lineHeight: '2.5rem',
    ...(animate && { animation: `${floatAnimation} 3s infinite ease-in-out` }),
  })
);

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