import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { GuestViewModel, RsvpEnum } from '@/types/api';
import { useFamily } from '@/store/family';
import { 
  useTheme, 
  useMediaQuery, 
  Button,
  alpha, 
  darken,
  styled,
  keyframes,
  CircularProgress
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Celebration,
  EventAvailable,
  FavoriteBorder, 
  Favorite 
} from '@mui/icons-material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypographyNoDrop, StephsStyledTypography } from '@/components/AttendanceButton/components/StyledComponents';
import { useBoxShadow } from '@/hooks/useBoxShadow';

// Define keyframes for animations
const blink = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 0.9; }
  100% { opacity: 0.3; }
`;

// Styled component for the attendance button
const StyledAttendanceButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  minHeight: '48px', // Reduced for better mobile compatibility
  width: '100%',
  padding: theme.spacing(1.25), // Adjusted padding
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smoother animation
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  borderStyle: 'solid',
  borderWidth: '2px',
  transform: 'perspective(1px) translateZ(0)', // Ensure 3D appearance
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("/textures/paper_texture.webp")',
    backgroundBlendMode: 'overlay',
    opacity: 0.08, // Slightly more visible texture
    pointerEvents: 'none',
  },
  // Ash effect on edges
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    boxShadow: 'inset 0 0 10px 2px rgba(0,0,0,0.2)',
    borderRadius: 'inherit',
    pointerEvents: 'none',
  },
}));

// Styled glow effect for selected buttons
const GlowEffect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-50%',
  left: '-50%',
  width: '200%',
  height: '200%',
  borderRadius: '50%',
  filter: 'blur(30px)',
  opacity: 0.25, // More visible glow
  pointerEvents: 'none',
  zIndex: 0,
  animation: 'pulse 2s infinite alternate', // Pulsing animation
  '@keyframes pulse': {
    '0%': {
      opacity: 0.2,
      transform: 'scale(0.95)',
    },
    '100%': {
      opacity: 0.3,
      transform: 'scale(1.05)',
    },
  },
}));

// Styled button container for equal button sizes
const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  position: 'relative',
  // Burn paper edge effect
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '-12px',
    left: '10%',
    right: '10%',
    height: '10px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, transparent 100%)',
    filter: 'blur(3px)',
    opacity: 0.5,
    zIndex: 0,
  },
  // Responsive layout
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
  '@media (max-width: 375px)': { // iPhone SE specific
    gap: theme.spacing(1.5), // Tighter spacing
    marginBottom: theme.spacing(1.5),
  }
}));

// Props for the attendance button component
interface AttendanceButtonProps {
  response: RsvpEnum;
  currentResponse: RsvpEnum | null;
  icon: React.ReactNode;
  selectedIcon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
  isPrimary?: boolean;
  isError?: boolean;
}

// Individual attendance button component
const AttendanceButton: React.FC<AttendanceButtonProps> = ({
  response,
  currentResponse,
  icon,
  selectedIcon,
  label,
  onClick,
  disabled,
  loading = false,
  isPrimary = false,
  isError = false
}) => {
  const theme = useTheme();
  const isSelected = currentResponse === response;
  const { boxShadow } = useBoxShadow();
  
  // Determine colors based on button type and selection state
  const getButtonStyles = () => {
    // Default background is transparent with a subtle border
    let backgroundColor = 'rgba(0,0,0,0.4)';
    let borderColor = alpha(theme.palette.secondary.main, 0.5);
    let textColor = theme.palette.secondary.main;
    let glowColor = theme.palette.secondary.main;
    
    if (isSelected) {
      if (isPrimary) {
        // Attending button when selected
        backgroundColor = alpha(theme.palette.primary.main, 0.7);
        borderColor = theme.palette.primary.main;
        textColor = '#ffffff';
        glowColor = theme.palette.primary.main;
      } else if (isError) {
        // Not attending button when selected
        backgroundColor = alpha(theme.palette.error.main, 0.7);
        borderColor = theme.palette.error.main;
        textColor = '#ffffff';
        glowColor = theme.palette.error.main;
      } else {
        // Default selected state
        backgroundColor = alpha(theme.palette.secondary.main, 0.7);
        borderColor = theme.palette.secondary.main;
        textColor = '#ffffff';
        glowColor = theme.palette.secondary.main;
      }
    } else {
      // Non-selected states
      if (isPrimary) {
        borderColor = alpha(theme.palette.primary.main, 0.7);
        textColor = theme.palette.primary.main;
      } else if (isError) {
        borderColor = alpha(theme.palette.error.main, 0.7);
        textColor = theme.palette.error.main;
      }
    }
    
    return {
      backgroundColor,
      borderColor,
      textColor,
      glowColor
    };
  };
  
  const styles = getButtonStyles();
  
  return (
    <StyledAttendanceButton
      onClick={onClick}
      disabled={disabled}
      sx={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        boxShadow: isSelected ? boxShadow : 'none',
        '&:hover': {
          backgroundColor: isSelected 
            ? styles.backgroundColor 
            : alpha(styles.borderColor, 0.2),
        },
      }}
    >
      {isSelected && (
        <GlowEffect sx={{ backgroundColor: styles.glowColor }} />
      )}
      
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1.5, sm: 2 }, // Smaller gap on tiny screens
        }}
      >
        <Box 
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '1.8rem' }, 
            display: 'flex',
            animation: isSelected ? 'iconPulse 2s infinite alternate' : 'none',
            '@keyframes iconPulse': {
              '0%': { transform: 'scale(1)' },
              '100%': { transform: 'scale(1.15)' },
            },
            transition: 'all 0.3s ease',
            filter: isSelected ? 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' : 'none',
            opacity: loading ? 0.4 : 1,
          }}
        >
          {isSelected ? selectedIcon : icon}
        </Box>
        
        <StephsStyledTypography
          variant="h6"
          textColor={styles.textColor}
          fontSize="1.1rem" // Base size for mobile
          shadowSize={isSelected ? 2 : 0}
          sx={{ 
            fontWeight: isSelected ? 700 : 400,
            lineHeight: 1.2, // Better text spacing
            letterSpacing: isSelected ? '0.03em' : 'normal',
            textTransform: 'uppercase',
            fontSize: { xs: '1.1rem', sm: '1.3rem' }, // Responsive font size through sx
            opacity: loading ? 0.4 : 1,
          }}
        >
          {label}
        </StephsStyledTypography>
        
        {loading && (
          <CircularProgress 
            size={24} 
            color={isPrimary ? "primary" : isError ? "error" : "secondary"} 
            sx={{ 
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: '-12px',
              marginTop: '-12px',
              zIndex: 2
            }} 
          />
        )}
      </Box>
    </StyledAttendanceButton>
  );
};

export const WelcomeSection: React.FC = () => {
  const [family, familyActions] = useFamily();
  const theme = useTheme();
  const { screenWidth } = useAppLayout();
  const isMobile = useMediaQuery('(max-width:375px)'); // iPhone SE size
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const [loadingGuestId, setLoadingGuestId] = useState<string | null>(null);

  // Force a refresh to ensure we have the latest data
  useEffect(() => {
    familyActions.getFamily();
  }, []);

  if (!family?.guests?.length) {
    return (
      <Box sx={{ width: '100%', py: 2 }}>
        <Typography variant="h5" component="p" gutterBottom align="center">
          Loading guest information...
        </Typography>
      </Box>
    );
  }

  const handleResponseChange = (guestId: string, response: RsvpEnum) => {
    // Set loading state for the specific guest and response
    setLoadingGuestId(guestId);
    
    // Get the current guest's wedding RSVP status
    const guest = family.guests.find(g => g.guestId === guestId);
    const currentResponse = guest?.rsvp?.wedding || null;
    
    // Only set to "Pending" if the clicked button matches the current selection
    // Otherwise, use the selected response value
    const valueToSet = currentResponse === response ? RsvpEnum.Pending : response;
    
    // Update with the appropriate value
    familyActions.updateFamilyGuestRsvp(guestId, valueToSet);
    
    // Set a timeout to clear the loading state after a reasonable time
    // This ensures users see the loading state even if the operation is quick
    setTimeout(() => {
      setLoadingGuestId(null);
    }, 1000);
  };

  // Check if form is in a loading/submitting state
  const isLoading = familyActions.patchFamilyGuestMutation.status === 'pending' || 
                    familyActions.getFamilyUnitQuery.isFetching;

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 4, 
          boxShadow: 3,
          background: 'rgba(0,0,0,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url("/textures/paper_texture.webp")',
            backgroundBlendMode: 'overlay',
            opacity: 0.05,
            pointerEvents: 'none',
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              background: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 1,
              py: 2,
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'url("/textures/paper_texture.webp")',
                opacity: 0.1,
                pointerEvents: 'none',
                zIndex: 0,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                opacity: 0.2,
                pointerEvents: 'none',
                zIndex: 0,
              }
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                mb: 1,
              }}
            >
              <EventAvailable 
                sx={{ 
                  mr: 1.5, 
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1.8rem', sm: '2rem' },
                  filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
                }} 
              />
              <StephsActualFavoriteTypographyNoDrop
                variant="h5"
                //component="h2"
                //textColor={theme.palette.primary.main}
                //shadowSize={1.5}
                fontSize={isMobile ? '1.2rem' : '1.5rem'}
                sx={{ 
                  my: 0, 
                  textAlign: 'center', 
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                }}
              >
                Will you be attending our wedding?
              </StephsActualFavoriteTypographyNoDrop>
            </Box>
            <Typography
              variant="body2"
              component="p"
              sx={{ 
                color: alpha(theme.palette.secondary.main, 0.8),
                opacity: 0.8,
                position: 'relative',
                zIndex: 1,
                fontWeight: '800',
                textAlign: 'center',
                fontSize: { xs: '0.9rem', sm: '1.0rem' },
                mt: 0.5,
                px: 2,
              }}
            >
              Saturday, July 5th
            </Typography>
            <Typography
              variant="body2"
              component="p"
              sx={{ 
                color: alpha('#FFFFF', 0.8),
                opacity: 0.8,
                position: 'relative',
                zIndex: 1,
                //fontStyle: 'italic',
                textAlign: 'center',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                mt: 0.5,
                px: 2,
              }}
            >
              Please confirm final attendance for each guest.
p            </Typography>
          </Box>
          
          <List 
            sx={{ 
              width: '100%',
              px: 0
            }}
          >
            {family.guests.map((guest, index) => (
              <ListItem 
                key={guest.guestId} 
                sx={{ 
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 3,
                  px: 0,
                  borderBottom: index < family.guests.length - 1 
                    ? `1px solid ${alpha(theme.palette.divider, 0.1)}` 
                    : 'none',
                }}
              >
                <Typography 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    mb: 2,
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                    textAlign: 'left',
                    width: '100%',
                    fontSize: isMobile ? '1.2rem' : '1.3rem',
                  }}
                >
                  {guest.firstName}
                </Typography>
                
                <ButtonContainer>
                  <AttendanceButton
                    response={RsvpEnum.Attending}
                    currentResponse={guest.rsvp?.wedding || null}
                    icon={<FavoriteBorder color="primary" fontSize="inherit" />}
                    selectedIcon={<Favorite color="inherit" fontSize="inherit" />}
                    label="I'll be there!"
                    onClick={() => handleResponseChange(guest.guestId, RsvpEnum.Attending)}
                    disabled={isLoading || (loadingGuestId !== null && loadingGuestId !== guest.guestId)}
                    loading={loadingGuestId === guest.guestId && RsvpEnum.Attending !== (guest.rsvp?.wedding || null)}
                    isPrimary
                  />
                  
                  <AttendanceButton
                    response={RsvpEnum.Declined}
                    currentResponse={guest.rsvp?.wedding || null}
                    icon={<Cancel color="error" fontSize="inherit" />}
                    selectedIcon={<Cancel color="inherit" fontSize="inherit" />}
                    label="Cannot attend"
                    onClick={() => handleResponseChange(guest.guestId, RsvpEnum.Declined)}
                    disabled={isLoading || (loadingGuestId !== null && loadingGuestId !== guest.guestId)}
                    loading={loadingGuestId === guest.guestId && RsvpEnum.Declined !== (guest.rsvp?.wedding || null)}
                    isError
                  />
                </ButtonContainer>
                
                {/* Status message based on current response */}
                {guest.rsvp?.wedding === RsvpEnum.Pending && (
                  <Box 
                    sx={{ 
                      width: '100%',
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.warning.main, 0.08),
                      backdropFilter: 'blur(4px)',
                      border: `1px dashed ${alpha(theme.palette.warning.main, 0.4)}`,
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url("/textures/paper_texture.webp")',
                        backgroundBlendMode: 'overlay',
                        opacity: 0.05,
                        pointerEvents: 'none',
                      }
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="warning.main" 
                      sx={{ 
                        fontStyle: 'italic',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      <Box component="span" sx={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: theme.palette.warning.main,
                        opacity: 0.6,
                        boxShadow: `0 0 6px ${theme.palette.warning.main}`,
                        animation: `${blink} 2s infinite`
                      }} />
                      Please select an option for {guest.firstName}
                    </Typography>
                  </Box>
                )}
                
                {guest.rsvp?.wedding === RsvpEnum.Attending && (
                  <Box 
                    sx={{ 
                      width: '100%',
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      backdropFilter: 'blur(4px)',
                      border: `1px dashed ${alpha(theme.palette.success.main, 0.5)}`,
                      textAlign: 'center',
                      boxShadow: `0 0 10px ${alpha(theme.palette.success.main, 0.15)}`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url("/textures/paper_texture.webp")',
                        backgroundBlendMode: 'overlay',
                        opacity: 0.05,
                        pointerEvents: 'none',
                      }
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="success.main" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                    >
                      <CheckCircle sx={{ 
                        fontSize: '1rem', 
                        mr: 0.5, 
                        verticalAlign: 'middle',
                        filter: `drop-shadow(0 0 2px ${alpha(theme.palette.success.main, 0.5)})`,
                      }} />
                      {guest.firstName} is attending - Thanks for confirming!
                    </Typography>
                  </Box>
                )}
                
                {guest.rsvp?.wedding === RsvpEnum.Declined && (
                  <Box 
                    sx={{ 
                      width: '100%',
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.text.secondary, 0.05),
                      backdropFilter: 'blur(4px)',
                      border: `1px dashed ${alpha(theme.palette.text.secondary, 0.3)}`,
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url("/textures/paper_texture.webp")',
                        backgroundBlendMode: 'overlay',
                        opacity: 0.05,
                        pointerEvents: 'none',
                      }
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontStyle: 'italic',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                    >
                      <Cancel sx={{ 
                        fontSize: '1rem', 
                        mr: 0.5, 
                        verticalAlign: 'middle',
                        opacity: 0.5
                      }} />
                      We'll miss {guest.firstName}! You can change this response if plans change before May 19.
                    </Typography>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
          
          <Box 
            sx={{ 
              mt: { xs: 2, sm: 3 }, 
              p: { xs: 1.5, sm: 2 }, 
              borderRadius: 1, 
              background: 'rgba(0,0,0,0.45)', 
              backdropFilter: 'blur(10px)',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("/textures/paper_texture.webp")',
                backgroundBlendMode: 'overlay',
                opacity: 0.05,
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  ${alpha(theme.palette.primary.main, 0.3)} 20%, 
                  ${alpha(theme.palette.primary.main, 0.6)} 50%,
                  ${alpha(theme.palette.primary.main, 0.3)} 80%, 
                  transparent 100%)`,
                boxShadow: `0 0 8px 1px ${alpha(theme.palette.primary.main, 0.3)}`,
              }
            }}
          >
            <Box component="div" sx={{ position: 'relative', zIndex: 1, px: 1 }}>
              <Typography 
                variant="body1" 
                color="secondary.main" 
                align="center"
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '0.9rem' },
                  lineHeight: 1.5,
                  fontWeight: 300,
                  letterSpacing: '0.02em',
                  //textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                Please continue through the RSVP process to provide additional details for attending guests.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WelcomeSection;