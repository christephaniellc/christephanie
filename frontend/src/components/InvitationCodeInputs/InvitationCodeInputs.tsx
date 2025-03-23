import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Link,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  alpha,
  useTheme,
  Chip,
  Container,
} from '@mui/material';
import { KeyOutlined, Edit, CalendarMonth, LocationOn } from '@mui/icons-material';
import { useRecoilValue } from 'recoil';
import { invitationButtonSelectorState } from '@/store/invitationInputs';
import { useUser } from '@/store/user';
import { useApiContext } from '@/context/ApiContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth0Queries } from '@/hooks/useAuth0Queries';
import {
  StephsFavoriteTypography,
  StephsActualFavoriteTypography,
  BlockTextTypography,
} from '@/components/AttendanceButton/AttendanceButton';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { rem } from 'polished';
import { useNavigate } from 'react-router-dom';
import { stdStepperState } from '@/store/steppers/steppers';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import ElPulpo from '@/assets/favicon_big_art_transparent.png';
import Countdowns from '@/components/Countdowns';
import { InvitationResponseEnum } from '@/types/api';

// Dialog component for editing invitation code
interface InvitationCodeDialogProps {
  open: boolean;
  onClose: () => void;
  invitationCode: string;
  onSave: (invitationCode: string) => void;
  currentUser: any;
}

const InvitationCodeDialog = ({
  open,
  onClose,
  invitationCode,
  onSave,
  currentUser,
}: InvitationCodeDialogProps) => {
  const theme = useTheme();
  const [code, setCode] = useState(invitationCode);
  
  // Helper function to create QR code URL
  const getQrCodeUrl = () => {
    const params: Record<string, string | undefined> = {
      inviteCode: code || undefined,
      firstName: currentUser?.firstName,
    };
    
    return generateQRCodeUrl('https://christephanie.com', params);
  };

  // Reset code state when dialog opens with new invitationCode
  useEffect(() => {
    if (open) {
      setCode(invitationCode);
    }
  }, [open, invitationCode]);

  const handleSave = () => {
    onSave(code);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code) {
      handleSave();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(20, 20, 25, 0.75)',
          backdropFilter: 'blur(30px)',
          background: 'rgba(0,0,0,0.6)',
          border: `1px solid ${theme.palette.secondary.main}`,
          borderRadius: 2,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
          overflow: 'hidden',
          position: 'relative',
          width: { xs: '95%', sm: '80%', md: '70%', lg: '60%' },
          maxWidth: '900px',
          mx: 'auto',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: { xs: 2, md: 3 },
          pt: { xs: 2, md: 3 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" width='100%'>
            {/*<KeyOutlined sx={{ mr: 1.5, color: theme.palette.secondary.main, fontSize: { xs: 24, md: 32 } }} />*/}
            <Typography mx='auto' variant="h5" color="secondary.main" fontWeight="bold" fontSize={{ xs: '1.25rem', md: '1.75rem' }}>
              {invitationCode ? 'Edit' : 'Add'} Invitation Code
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ py: { xs: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: { sm: '80%', md: '75%' },
          mx: 'auto'
        }}>
          <Box sx={{ width: '100%' }}>
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              variant="outlined"
              value={code || ''}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              sx={{
                mt: 1,
                '& .MuiInputBase-input': {
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                  textAlign: 'center',
                  py: { xs: 1.5, md: 2 },
                  letterSpacing: { xs: 1, md: 2 },
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(15px)',
                  borderRadius: 2,
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.secondary.main,
                      borderWidth: 2,
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.25)',
                  },
                },
                '& .MuiFormLabel-root': {
                  color: alpha(theme.palette.secondary.main, 0.8),
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  transform: 'translate(14px, 16px) scale(1)',
                },
                '& .MuiFormHelperText-root': {
                  color: alpha(theme.palette.common.white, 0.7),
                  fontSize: '0.85rem',
                  mt: 1.5,
                },
              }}
              InputProps={{
                startAdornment: <KeyOutlined color="secondary" sx={{ mr: 1, opacity: 0.8, fontSize: { xs: 24, md: 28 } }} />,
              }}
            />

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 2,
                textAlign: 'center',
                fontSize: { xs: '0.9rem', md: '1rem' },
                lineHeight: 1.5,
                px: 1,
              }}
            >
              Find your invitation code on your printed wedding invitation, or contact your hosts.
            </Typography>
          </Box>
          
        </Box>
      </DialogContent>
      <DialogActions 
        sx={{ 
          px: { xs: 3, md: 5 }, 
          py: { xs: 3, md: 4 },
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center', // Changed to center since we removed the QR code
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 2 }
        }}
      >
        {/* Buttons group */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          width: { xs: '100%', sm: 'auto' },
          justifyContent: 'center'
        }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="secondary"
            sx={{
              borderRadius: 2,
              px: { xs: 3, md: 4 },
              py: { xs: 1, md: 1.25 },
              fontSize: { xs: '0.875rem', md: '1rem' },
              minWidth: { xs: '100px', md: '120px' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!code}
            color="secondary"
            variant="contained"
            sx={{
              borderRadius: 2,
              px: { xs: 4, md: 5 },
              py: { xs: 1, md: 1.25 },
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', md: '1rem' },
              minWidth: { xs: '100px', md: '120px' },
              textTransform: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              '&:hover': {
                boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
              },
              '&:disabled': {
                backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                color: alpha(theme.palette.common.white, 0.4),
              },
            }}
          >
            Submit
          </Button>
        </Box>
      </DialogActions>

      {/* Decorative corner elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 15,
          height: 15,
          borderTop: `1px solid ${theme.palette.primary.main}`,
          borderLeft: `1px solid ${theme.palette.primary.main}`,
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 15,
          height: 15,
          borderTop: `1px solid ${theme.palette.primary.main}`,
          borderRight: `1px solid ${theme.palette.primary.main}`,
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          width: 15,
          height: 15,
          borderBottom: `1px solid ${theme.palette.primary.main}`,
          borderLeft: `1px solid ${theme.palette.primary.main}`,
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          width: 15,
          height: 15,
          borderBottom: `1px solid ${theme.palette.primary.main}`,
          borderRight: `1px solid ${theme.palette.primary.main}`,
          zIndex: 1,
        }}
      />
    </Dialog>
  );
};

export const InvitationCodeInputs = () => {
  const api = useApiContext();
  const navigate = useNavigate();
  const [user, userActions] = useUser();
  const invitationButtonText = useRecoilValue(invitationButtonSelectorState);
  const { user: auth0User, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { signInWithAuth0, logOutFromAuth0 } = useAuth0Queries();
  const boxShadow = useBoxShadow();
  const theme = useTheme();

  // Store the access token in state so we don't trigger errors during render.
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hasAuthed, setHasAuthed] = useState(false);
  const [invitationCodeDialogOpen, setInvitationCodeDialogOpen] = useState(false);

  useEffect(() => {
    if (!!auth0User && !hasAuthed) {
      setHasAuthed(true);
    }
  }, [auth0User]);

  useEffect(() => {
    const fetchToken = async () => {
      if (!isAuthenticated) {
        console.debug('User is not authenticated; skipping token refresh.');
        setAccessToken(null);
        return;
      }
      try {
        const token = await getAccessTokenSilently();
        setAccessToken(token);
      } catch (error: any) {
        if (error.message && error.message.includes('Missing Refresh Token')) {
          console.warn('No refresh token available. User might need to log in again.');
          setAccessToken(null);
        } else {
          console.error('Error retrieving access token:', error);
          setAccessToken(null);
        }
      }
    };
    fetchToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const stdStepper = useRecoilValue(stdStepperState);
  const firstIncompleteStep = useMemo(() => {
    const incompleteStep = Object.values(stdStepper.steps).find((step) => !step.completed);
    return incompleteStep ? incompleteStep[0] : null;
  }, [stdStepper.steps]);

  useEffect(() => {
    if (hasAuthed) {
      // Direct users to the Welcome/Home page instead of SaveTheDate step
      navigate(routes[Pages.Welcome].path);
    }
  }, [hasAuthed]);

  const handleFindUser = async () => {
    const result = await userActions.findUserIdQuery?.refetch();
    if (result && result.data && result.data.auth0Id) {
      userActions.setUser({ ...user, auth0Id: result.data.auth0Id, guestId: result.data.guestId });

      // Small delay to ensure state is updated before proceeding
      // This helps prevent iOS touch event issues
      setTimeout(() => {
        signInWithAuth0(result.data.guestId, result.data.auth0Id);
      }, 50);
    }
  };

  const handleUpdateInvitationCode = (newCode: string) => {
    if (user) {
      userActions.setUser({ ...user, invitationCode: newCode });
    }
  };

  if (!user) return null;

  const hasInvitationCode = Boolean(user?.invitationCode);

  // Random quotes for wedding announcement
  const weddingQuotes = [
    "We're tying the knot",
    "We're getting married",
    'Join us for our wedding',
    "We're saying 'I do'",
    'Come celebrate with us',
  ];

  // Choose a random quote
  const randomQuoteIndex = useMemo(() => Math.floor(Math.random() * weddingQuotes.length), []);
  const randomGettingMarriedQuote = weddingQuotes[randomQuoteIndex];

  // Generate sparkle animation styles
  const generateSparkleStyles = () => {
    return {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'visible',
      padding: '20px',
      margin: '-20px',
      '@keyframes sparkle': {
        '0%': { opacity: 0, transform: 'scale(0) rotate(0deg)' },
        '50%': { opacity: 1, transform: 'scale(1) rotate(180deg)' },
        '100%': { opacity: 0, transform: 'scale(0) rotate(360deg)' },
      },
    };
  };

  // Date text styles with bounce animation
  const dateTextStyles = {
    fontWeight: '1000',
    color: theme.palette.common.white,
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7), 2px 2px 2px #000000',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1,
    width: '100%',
    textAlign: 'center',
    '@keyframes dateBounce': {
      '0%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-4px)' },
      '100%': { transform: 'translateY(0)' },
    },
    animation: user?.auth0Id ? 'dateBounce 2s infinite ease-in-out' : 'none',
    '&:hover': {
      color: theme.palette.primary.light,
      textShadow: `1px 1px 2px rgba(0, 0, 0, 0.7), 2px 2px 2px #000000, 0 0 8px ${theme.palette.primary.light}`,
    },
    fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.5rem' },
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexWrap="wrap"
      minHeight={{ xs: 'auto', sm: 450 }}
      onMouseMove={boxShadow.handleMouseMove}
      role="region"
      aria-label="Invitation code entry form"
      sx={{
        position: 'relative',
        overflow: 'visible',
        pb: { xs: 5, sm: 0 }, // Add padding at bottom on mobile for keyboard space
      }}
    >
      {/* Main card with enhanced styling */}
      <Card
        width={'100%'}
        mb={3}
        pb={2}
        component={Box}
        sx={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(15px)',
          boxShadow: boxShadow.boxShadow,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* QR code and El Pulpo as decorative elements in corners */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 10, sm: 15 },
            right: { xs: 10, sm: 15 },
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Box
            component="img"
            src={ElPulpo}
            alt="El Pulpo"
            sx={{
              height: { xs: 32, sm: 40 }, // Smaller on mobile
              width: { xs: 32, sm: 40 },
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center top',
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.6)}`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            }}
          />
        </Box>

        {/* Decorative corner elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: 15,
            height: 15,
            borderTop: `1px solid ${theme.palette.primary.main}`,
            borderLeft: `1px solid ${theme.palette.primary.main}`,
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            width: 15,
            height: 15,
            borderBottom: `1px solid ${theme.palette.primary.main}`,
            borderRight: `1px solid ${theme.palette.primary.main}`,
            zIndex: 1,
          }}
        />

        <CardHeader
          title={
            !user?.guestId
              ? '' //'Please enter your information to get started.'
              : `Welcome back ${user?.firstName}!`
          }
          subheader={''}
          aria-live="polite"
          sx={{
            textAlign: 'center',
            pb: { sm: 2, md: 3 }, // Less padding on mobile
            pt: { xs: 2, sm: 2 }, // Adjust top padding for El Pulpo icon space
            '& .MuiCardHeader-title': {
              fontSize: { xs: '1.25rem', sm: '1.5rem' }, // Smaller title on mobile
              width: { xs: '85%', lg: '90%' }, // Full width on mobile
              fontWeight: 'bold',
              color: theme.palette.secondary.main,
              textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
              lineHeight: 1.3, // Better line height for wrapping
              overflowWrap: 'break-word', // Handle long names better
            },
            '& .MuiCardHeader-subheader': {
              fontSize: { xs: '0.85rem', sm: '0.95rem' }, // Smaller subheader on mobile
              color: alpha(theme.palette.common.white, 0.7),
              mt: { xs: 0.5, sm: 1 }, // Less margin on mobile
            },
          }}
        />

        {/* Wedding announcement for logged in users */}
        {user?.auth0Id && (
          <Box
            sx={{
              textAlign: 'center',
              mb: { xs: 1, sm: 2 },
              px: 2,
              mt: { xs: -2, sm: -1 }, // More negative margin on mobile to save space
              // Scale down on small screens
              transform: { xs: 'scale(0.95)', sm: 'none' },
            }}
          >
            <BlockTextTypography
              variant="h6"
              color="secondary"
              sx={{
                fontStyle: 'normal',
                fontSize: { xs: '1rem', sm: 'h6.fontSize' }, // Smaller on mobile
              }}
              shadowcolor={'#000000'}
              maxpx={2}
            >
              {randomGettingMarriedQuote}!
            </BlockTextTypography>

            {/* Wedding countdown - conditionally shown based on screen size */}
            <Box
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                my: { xs: 0.5, sm: 1 },
                // On very small screens, hide to save space when keyboard may be visible
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              <Typography
                variant="subtitle2"
                color="common.white"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                  opacity: 0.9,
                  backdropFilter: 'blur(3px)',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  padding: { xs: '2px 6px', sm: '4px 8px' }, // Less padding on mobile
                  borderRadius: '4px',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
                }}
              >
                <Countdowns
                  event="Wedding"
                  interested={user.rsvp?.invitationResponse || InvitationResponseEnum.Pending}
                />
              </Typography>
            </Box>
          </Box>
        )}

        <CardContent sx={{ pt: 0 }}>
          <>
            {!user?.auth0Id && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  user?.guestId ? signInWithAuth0(user.guestId, user.auth0Id) : handleFindUser();
                }}
                onKeyDown={(e) => {
                  // Prevent keyboard events from closing the drawer
                  e.stopPropagation();
                }}
                aria-label="Invitation details"
              >
                <TextField
                  fullWidth
                  disabled={false}
                  autoComplete={'off'}
                  value={user?.firstName || ''}
                  label="First Name"
                  onChange={(e) => userActions.setUser({ ...user, firstName: e.target.value })}
                  variant="outlined"
                  id="firstname-input"
                  aria-required="true"
                  aria-describedby="firstname-description"
                  inputProps={{
                    'aria-label': 'First Name',
                  }}
                  sx={{
                    marginBottom: 2,
                    '& .MuiInputBase-input': {
                      fontSize: 'h4.fontSize',
                      textAlign: 'center',
                      color: 'text.secondary !important',
                    },
                    '& .MuiOutlinedInput-root': {
                      backdropFilter: 'blur(10px)',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.3)',
                      },
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      user?.guestId
                        ? signInWithAuth0(user.guestId, user.auth0Id)
                        : handleFindUser();
                    }
                  }}
                  autoFocus
                />
                <Typography
                  id="firstname-description"
                  sx={{
                    position: 'absolute',
                    height: 1,
                    width: 1,
                    overflow: 'hidden',
                    clip: 'rect(0 0 0 0)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Enter your first name
                </Typography>

                {/* Invitation code section - mobile optimized */}
                {hasInvitationCode ? (
                  <Box
                    onClick={() => setInvitationCodeDialogOpen(true)}
                    sx={{
                      mb: 2,
                      width: '100%',
                      cursor: 'pointer',
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Edit invitation code"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setInvitationCodeDialogOpen(true);
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.4)',
                        border: `1px solid ${theme.palette.secondary.main}`,
                        borderRadius: '8px',
                        py: { xs: 1.5, sm: 2 }, // Less padding on mobile
                        px: { xs: 1.5, sm: 2 },
                        width: '100%',
                        position: 'relative',
                        backdropFilter: 'blur(15px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.5)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 15px rgba(0,0,0,0.4)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: { xs: 0.5, sm: 1 },
                            mb: { xs: 0.5, sm: 1 },
                            flexWrap: { xs: 'wrap', sm: 'nowrap' }, // On mobile, wrap if needed
                          }}
                        >
                          <KeyOutlined
                            color="secondary"
                            sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' } }} // Smaller icon on mobile
                          />
                          <Typography
                            color="secondary.main"
                            fontWeight="bold"
                            sx={{
                              fontSize: { xs: '0.9rem', sm: '1rem' }, // Smaller on mobile
                              mx: { xs: 0.5, sm: 1 },
                            }}
                          >
                            Your Invitation Code
                          </Typography>
                          <Edit
                            className="edit-icon"
                            sx={{
                              ml: { xs: 0.5, sm: 1 },
                              fontSize: { xs: '1.1rem', sm: '1.3rem' }, // Smaller icon on mobile
                              color: alpha(theme.palette.secondary.main, 0.7),
                              transition: 'color 0.2s ease',
                            }}
                          />
                        </Box>

                        <Typography
                          sx={{
                            color: theme.palette.secondary.main,
                            fontWeight: 'bold',
                            fontSize: { xs: '1.3rem', sm: '1.6rem' }, // Smaller on mobile
                            lineHeight: 1,
                            letterSpacing: { xs: 1, sm: 2 }, // Less spacing on mobile
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            wordBreak: 'break-all', // In case of very long codes
                            maxWidth: '100%',
                          }}
                        >
                          {user.invitationCode}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={() => setInvitationCodeDialogOpen(true)}
                    sx={{
                      mb: 2,
                      py: { xs: 1.2, sm: 1.5 }, // Less padding on mobile
                      borderRadius: '8px',
                      boxShadow: boxShadow.boxShadow,
                      backdropFilter: 'blur(10px)',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      transition: 'all 0.3s ease',
                      fontSize: { xs: '0.9rem', sm: 'inherit' }, // Smaller font on mobile
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        transform: 'translateY(-2px)',
                        boxShadow: boxShadow.boxShadow,
                      },
                    }}
                    aria-label="Add invitation code"
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.5, sm: 1 }, // Less gap on mobile
                        '& .MuiSvgIcon-root': {
                          fontSize: { xs: '1.1rem', sm: '1.3rem' }, // Smaller icons on mobile
                        },
                      }}
                    >
                      <KeyOutlined sx={{ mr: 0.5 }} />
                      <span>Add invitation code</span> {/* Shorter text on mobile */}
                      <Edit sx={{ ml: 0.5 }} />
                    </Box>
                  </Button>
                )}
                <Typography
                  id="invitation-code-description"
                  sx={{
                    position: 'absolute',
                    height: 1,
                    width: 1,
                    overflow: 'hidden',
                    clip: 'rect(0 0 0 0)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Enter the invitation code from your wedding invitation
                </Typography>
              </form>
            )}
          </>
        </CardContent>

        <CardActions
          sx={{
            // Stick close to bottom of viewport on mobile screens to keep action visible
            position: { xs: 'sticky', sm: 'static' },
            bottom: { xs: 0, sm: 'auto' },
            zIndex: { xs: 2, sm: 'auto' },
            backgroundColor: 'transparent', // Match card background
            backdropFilter: 'none', // Remove blur effect
            pb: { xs: 2, sm: 2 },
            pt: { xs: 1.5, sm: 0 },
            px: { xs: 1.5, sm: 2 },
            //boxShadow: 'none', // Remove any shadow
            boxShadow: '0 -3px 0px rgba(0,0,0,0.1)',
            mt: { xs: 'auto', sm: 0 }, // Push to bottom when there's space
          }}
        >
          <Box display="flex" flexDirection="column" width="100%">
            <Button
              sx={{
                width: '100%',
                mb: { xs: 1, sm: 2 },
                py: { xs: 1, sm: 1.2 }, // Smaller on mobile
                borderRadius: '8px',
                textTransform: 'none',
                backgroundColor: theme.palette.primary.main, // Ensure button has proper background
                //boxShadow: 'none', // Remove any shadow that might cause dark areas
		boxShadow: boxShadow.boxShadow,
                transition: 'all 0.3s ease',
                '&:hover:not(:disabled)': {
                  transform: 'translateY(-2px)',
		  boxShadow: boxShadow.boxShadow,
                  backgroundColor: theme.palette.primary.dark, // Darker on hover
                },
                '&:disabled': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.5), // Lighter when disabled
                  color: alpha(theme.palette.common.white, 0.7)
                }
              }}
              disabled={!user?.firstName || !user?.invitationCode}
              fullWidth
              variant="contained"
              onClick={() =>
                user?.guestId ? signInWithAuth0(user.guestId, user.auth0Id) : handleFindUser()
              }
              aria-label={user?.auth0Id ? 'Login With your Existing Account' : invitationButtonText}
            >
              <Typography sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: { xs: '1.2rem', sm: '1.3rem' },
                textTransform: 'uppercase',
                fontWeight: 800,
                animation: 'none',  // Remove the floating animation
                backgroundColor: 'transparent' // Ensure text background is transparent
              }}>
                {user?.auth0Id ? 'Login With your Existing Account' : invitationButtonText}
              </Typography>
            </Button>
            {user.firstName && user.auth0Id && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.85rem', sm: rem(16) },
                  textAlign: 'center',
                  mt: { xs: 0.5, sm: 1 },
                }}
              >
                Not {user?.firstName}?{' '}
                <Link
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textDecoration: 'underline', // More visible on mobile
                    display: 'inline-block', // Larger touch target on mobile
                    py: 0.5,
                  }}
                  onClick={() => {
                    window.localStorage.removeItem('user');
                    window.location.reload();
                  }}
                  role="button"
                  aria-label="Reset and enter a different name"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      window.localStorage.removeItem('user');
                      window.location.reload();
                    }
                  }}
                >
                  Click here
                </Link>
              </Typography>
            )}
          </Box>
        </CardActions>
      </Card>

      {/* Login with existing account card - mobile optimized */}
      {accessToken && user.guestId && (
        <>
          <StephsFavoriteTypography
            mx="auto"
            aria-hidden="true"
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: '1rem', sm: '1.2rem' }, // Smaller on mobile
              opacity: 0.9,
            }}
          >
            OR
          </StephsFavoriteTypography>
          <Card
            sx={{
              width: '100%',
              pb: { xs: 1.5, sm: 2 },
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(15px)',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: 'all 0.3s ease',
              mb: { xs: 4, sm: 0 }, // Add bottom margin on mobile to ensure visibility
              '&:hover': {
                boxShadow: `0 8px 20px rgba(0,0,0,0.4)`,
                borderColor: alpha(theme.palette.primary.main, 0.5),
              },
            }}
          >
            <CardHeader
              subheader="Login with your existing account"
              aria-live="polite"
              sx={{
                textAlign: 'center',
                py: { xs: 1, sm: 1.5 }, // Less padding on mobile
                '& .MuiCardHeader-subheader': {
                  color: alpha(theme.palette.common.white, 0.8),
                  fontSize: { xs: '0.95rem', sm: '1.05rem' }, // Smaller on mobile
                },
              }}
            />
            <CardActions sx={{ pt: 0 }}>
              <Button
                fullWidth
                color="primary"
                variant="contained"
                sx={{
                  mx: { xs: 1.5, sm: 2 },
                  py: { xs: 0.8, sm: 1 }, // Less padding on mobile
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  fontSize: { xs: '0.9rem', sm: 'inherit' }, // Smaller on mobile
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                  },
                }}
                onClick={() => {
                  auth0User
                    ? logOutFromAuth0()
                    : user.guestId
                      ? signInWithAuth0(user.guestId, user.auth0Id)
                      : console.log('No GuestId found.');
                }}
                aria-label={
                  auth0User ? 'Logout from your account' : 'Login with your existing account'
                }
              >
                {auth0User ? 'Logout' : 'Login'}
              </Button>
            </CardActions>
          </Card>
        </>
      )}

      {/* Dialog for editing invitation code */}
      <InvitationCodeDialog
        open={invitationCodeDialogOpen}
        onClose={() => setInvitationCodeDialogOpen(false)}
        invitationCode={user?.invitationCode || ''}
        onSave={handleUpdateInvitationCode}
        currentUser={user}
      />
    </Box>
  );
};
