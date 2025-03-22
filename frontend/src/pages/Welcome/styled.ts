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
  overflow: 'auto',
}));

const BackgroundOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: alpha('#000', 0.25), // Darker overlay for better mobile readability
  backdropFilter: 'blur(2px)',
  zIndex: 1,
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
  zIndex: 2,
  padding: 0,
  paddingBottom: '80px', // Space for bottom nav
}));

const WeddingInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  paddingTop: '0px',
  paddingBottom: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(3),
  },
  [theme.breakpoints.up('lg')]: {
    marginBottom: theme.spacing(4),
  },
}));

const WeddingInfoLayout = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center', // Center content vertically
  textAlign: 'center', // Center text within components
  // [theme.breakpoints.up('md')]: {
  //   flexDirection: 'row',
  // },
}));

const MarriageAnnouncementBox = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  mx: 'auto',
  borderRadius: theme.shape.borderRadius,
  textAlign: 'center',
  whiteSpace: 'normal',
  wordWrap: 'break-word',
}));

const WeddingDetailsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Center content horizontally
  width: '100%', // Take up full width
  [theme.breakpoints.up('md')]: {
    flex: 1,
  },
}));

const DateBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center', // Center horizontally 
  width: '100%', // Take full width
  mx: 'auto',
  marginBottom: theme.spacing(0.8),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  //padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
}));

const LocationBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: alpha(theme.palette.background.paper, 0.2),
  borderRadius: theme.shape.borderRadius,
  backdropFilter: 'blur(8px)',
}));

const CountdownBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.up('md')]: {
    position: 'relative', // Prepare for absolute positioning in larger screens
  },
}));

const SideCountdownContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '0 auto',
  [theme.breakpoints.up('md')]: {
    position: 'absolute',
    right: '-10px',
    top: '50%',
    transform: 'translateY(-50%) translateX(100%)',
    width: '180px',
    backgroundColor: alpha('#000', 0.6),
    backdropFilter: 'blur(8px)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
    boxShadow: `0 4px 20px ${alpha('#000', 0.25)}`,
  },
  [theme.breakpoints.up('lg')]: {
    width: '200px',
    right: '-20px',
  },
}));

const LocationText = styled(Typography)(({ theme }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: theme.palette.common.white,
  fontSize: '1rem',
  //textShadow: `1px 1px 3px ${alpha('#000', 0.7)}`,
   textShadow: '-2px -2px 0 #000000, -1px -1px 0 #000000',
  [theme.breakpoints.up('md')]: {
    fontSize: '1.1rem',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '1.3rem',
  },
}));

const DateText = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 'medium',
  fontSize: '1.1rem',
  textAlign: 'center', // Ensure text is centered
  width: '100%', // Take up full width
  [theme.breakpoints.up('md')]: {
    fontSize: '1.2rem',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '1.5rem',
  },
}));

const QuoteText = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  opacity: 0.9,
  fontSize: '0.85rem',
  fontStyle: 'italic',
  marginBottom: theme.spacing(0.5), // Reduced margin
  marginTop: -4,
  display: 'block',
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    fontSize: '0.9rem',
  },
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: 0, // No margin to reduce space
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  maxWidth: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: theme.spacing(2),
  minHeight: '350px', // Increased to accommodate title
  justifyContent: 'flex-end',
  boxShadow: 'none',
  padding: 0,
  overflow: 'visible', // Changed from 'auto' to prevent cutting off content
  [theme.breakpoints.up('md')]: {
    maxWidth: '500px',
    minHeight: '400px', // Even more space on larger screens
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '600px',
    minHeight: '450px', // More space on largest screens
  },
}));

// Removed StepperModal - now using normal scrolling instead

export {
  Image,
  WelcomeContainer,
  BackgroundOverlay,
  ContentContainer,
  WeddingInfoContainer,
  WeddingInfoLayout,
  MarriageAnnouncementBox,
  WeddingDetailsBox,
  DateBox,
  LocationBox,
  CountdownBox,
  SideCountdownContainer,
  LocationText,
  DateText,
  QuoteText,
  TitleContainer,
  StepperContainer,
};
