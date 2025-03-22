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
} from '@mui/material';
import { KeyOutlined, Edit } from '@mui/icons-material';
import { useRecoilValue } from 'recoil';
import { invitationButtonSelectorState } from '@/store/invitationInputs';
import { useUser } from '@/store/user';
import { useApiContext } from '@/context/ApiContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth0Queries } from '@/hooks/useAuth0Queries';
import { StephsFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { rem } from 'polished';
import { useNavigate } from 'react-router-dom';
import { stdStepperState } from '@/store/steppers/steppers';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';

// Dialog component for editing invitation code
interface InvitationCodeDialogProps {
  open: boolean;
  onClose: () => void;
  invitationCode: string;
  onSave: (invitationCode: string) => void;
}

const InvitationCodeDialog = ({
  open,
  onClose,
  invitationCode,
  onSave,
}: InvitationCodeDialogProps) => {
  const theme = useTheme();
  const [code, setCode] = useState(invitationCode);

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
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }
        }
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
        },
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
        pb: 2,
        position: 'relative',
        zIndex: 1,
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <KeyOutlined sx={{ mr: 1, color: theme.palette.secondary.main }} />
            <Typography variant="h6" color="secondary.main">
              {invitationCode ? 'Edit' : 'Add'} Invitation Code
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {code && (
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  p: 0.5,
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                  height: 36,
                  width: 36,
                }}
              >
                <Box 
                  component="img"
                  alt="QR Code"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=30x30&data=https://christephanie.com?inviteCode=${encodeURIComponent(code)}`}
                  sx={{ 
                    width: 30,
                    height: 30,
                  }}
                />
              </Box>
            )}
            <Box 
              component="img"
              src={ElPulpo}
              alt="El Pulpo"
              sx={{
                height: 36,
                width: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center top',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
              }}
            />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Invitation Code"
          fullWidth
          variant="outlined"
          value={code || ''}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            mt: 3,
            '& .MuiInputBase-input': {
              fontSize: 'h5.fontSize',
              textAlign: 'center',
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(15px)',
              borderRadius: 1.5,
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.secondary.main,
                  borderWidth: 2,
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.25)',
              }
            },
            '& .MuiFormLabel-root': {
              color: alpha(theme.palette.secondary.main, 0.8),
            },
            '& .MuiFormHelperText-root': {
              color: alpha(theme.palette.common.white, 0.7),
              fontSize: '0.85rem',
              mt: 1.5
            }
          }}
          InputProps={{
            startAdornment: (
              <KeyOutlined color="secondary" sx={{ mr: 1, opacity: 0.8 }} />
            ),
          }}
        />
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mt: 2, 
            textAlign: 'center',
            fontSize: '0.85rem'
          }}
        >
          Find your invitation code on the bottom left of your printed invitation
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, position: 'relative', zIndex: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="secondary"
          sx={{
            borderRadius: 2,
            px: 3
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
            px: 4,
            fontWeight: 'bold',
            '&:disabled': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.2),
              color: alpha(theme.palette.common.white, 0.4)
            }
          }}
        >
          Save
        </Button>
      </DialogActions>

      {/* Decorative corner elements */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        width: 15, 
        height: 15, 
        borderTop: `1px solid ${theme.palette.primary.main}`, 
        borderLeft: `1px solid ${theme.palette.primary.main}`,
        zIndex: 1
      }} />
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        width: 15, 
        height: 15, 
        borderTop: `1px solid ${theme.palette.primary.main}`, 
        borderRight: `1px solid ${theme.palette.primary.main}`,
        zIndex: 1
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: 10, 
        left: 10, 
        width: 15, 
        height: 15, 
        borderBottom: `1px solid ${theme.palette.primary.main}`, 
        borderLeft: `1px solid ${theme.palette.primary.main}`,
        zIndex: 1
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: 10, 
        right: 10, 
        width: 15, 
        height: 15, 
        borderBottom: `1px solid ${theme.palette.primary.main}`, 
        borderRight: `1px solid ${theme.palette.primary.main}`,
        zIndex: 1
      }} />
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

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      height={400}
      onMouseMove={boxShadow.handleMouseMove}
      role="region"
      aria-label="Invitation code entry form"
    >
      <Card
        width={'100%'}
        mb={2}
        pb={2}
        component={Box}
        sx={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: boxShadow.boxShadow,
        }}
      >
        <CardHeader
          title={
            !user?.guestId
              ? 'Please enter your information to get started.'
              : `Welcome back ${user?.firstName}!`
          }
          subheader={
            !accessToken && !user?.guestId
              ? `...or click Login below, if you've already created an account`
              : ''
          }
          aria-live="polite"
        />
        <CardContent>
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
                  Enter your first name as it appears on your invitation
                </Typography>

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
                    <Chip
                      label={user.invitationCode}
                      color="secondary"
                      variant="outlined"
                      icon={<KeyOutlined />}
                      deleteIcon={<Edit />}
                      onDelete={(e) => {
                        e.stopPropagation();
                        setInvitationCodeDialogOpen(true);
                      }}
                      sx={{
                        fontSize: '1.1rem',
                        py: 2.5,
                        width: '100%',
                        justifyContent: 'space-between',
                        '& .MuiChip-label': {
                          px: 2,
                          flexGrow: 1,
                          textAlign: 'center',
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    startIcon={<KeyOutlined />}
                    endIcon={<Edit />}
                    onClick={() => setInvitationCodeDialogOpen(true)}
                    sx={{ mb: 2, py: 1.5 }}
                    aria-label="Add invitation code"
                  >
                    Click to add invitation code
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
        <CardActions>
          <Box display="flex" flexDirection="column" width="100%" px={1}>
            <Button
              sx={{ width: '100%', mb: 2 }}
              disabled={!user?.firstName || !user?.invitationCode}
              fullWidth
              variant="contained"
              onClick={() =>
                user?.guestId ? signInWithAuth0(user.guestId, user.auth0Id) : handleFindUser()
              }
              aria-label={user?.auth0Id ? 'Login With your Existing Account' : invitationButtonText}
            >
              {user?.auth0Id ? 'Login With your Existing Account' : invitationButtonText}
            </Button>
            {user.firstName && (
              <Typography variant="caption" sx={{ fontSize: rem(16) }}>
                Not {user?.firstName}?{' '}
                <Link
                  sx={{ cursor: 'pointer' }}
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
      {accessToken && user.guestId && (
        <>
          <StephsFavoriteTypography mx="auto" aria-hidden="true">
            OR
          </StephsFavoriteTypography>
          <Card sx={{ width: '100%', mt: 2, pb: 2 }}>
            <CardHeader subheader="Login with your existing account" aria-live="polite" />
            <CardActions>
              <Button
                fullWidth
                color="primary"
                variant="contained"
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
      />
    </Box>
  );
};
