import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const Image = styled('img')({
  width: '10%',
  height: '10%',
  margin: 4,
});

const WelcomeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const BackgroundOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: alpha('#000', 0.45),
  backdropFilter: 'blur(3px)',
  zIndex: 1,
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  zIndex: 2,
}));

const WeddingInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(2),
  // backdropFilter: 'blur(5px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.15),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(4),
  }
}));

const LocationText = styled(Typography)(({ theme }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: theme.palette.common.white,
  fontSize: '1.1rem',
  textShadow: `1px 1px 3px ${alpha('#000', 0.7)}`,
  marginTop: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.3rem',
  }
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  paddingBottom: 20,
  maxWidth: 600,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: theme.spacing(2),
  height: '100%',
  overflow: 'auto',
  backgroundColor: alpha(theme.palette.background.paper, 0.25),
  backdropFilter: 'blur(8px)',
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0 4px 30px ${alpha('#000', 0.1)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  padding: theme.spacing(2),
}));

export { 
  Image, 
  WelcomeContainer, 
  BackgroundOverlay, 
  ContentContainer, 
  WeddingInfoContainer,
  LocationText,
  StepperContainer 
};
