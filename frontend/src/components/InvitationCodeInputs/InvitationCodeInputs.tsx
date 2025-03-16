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
} from '@mui/material';
import { useRecoilValue } from 'recoil';
import { invitationButtonSelectorState } from '@/store/invitationInputs';
import { useUser } from '@/store/user';
import { useApiContext } from '@/context/ApiContext';
import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { useAuth0Queries } from '@/hooks/useAuth0Queries';
import { StephsFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { rem } from 'polished';
import { useNavigate } from 'react-router-dom';
import { stdStepperState } from '@/store/steppers/steppers';
import routes from '@/routes';
import { Pages } from '@/routes/types';

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
    if (hasAuthed && firstIncompleteStep !== null) {
      navigate(`${routes[Pages.SaveTheDate].path}?step=${firstIncompleteStep}`);
    }
  }, [hasAuthed, firstIncompleteStep]);

  const handleFindUser = async () => {
    const result = await userActions.findUserIdQuery?.refetch();
    if (result && result.data && result.data.auth0Id) {
      userActions.setUser({ ...user, auth0Id: result.data.auth0Id, guestId: result.data.guestId });
      signInWithAuth0(result.data.guestId);
    }
  };

  if (!user) return null;

  return (
    <Box display="flex" flexWrap="wrap" height={400} onMouseMove={boxShadow.handleMouseMove}>
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
              ? 'Please enter your invitation to get started.'
              : `Welcome back ${user?.firstName}!`
          }
          subheader={
            !accessToken && !user?.guestId
              ? `...or click Login below, if you've already created an account`
              : ''
          }
        />
        <CardContent>
          <>
            {!user?.auth0Id && (
              <>
                <TextField
                  autoComplete={'off'}
                  disabled={false}
                  fullWidth
                  value={user?.invitationCode}
                  label="Enter your Invitation Code"
                  onChange={(e) => userActions.setUser({ ...user, invitationCode: e.target.value })}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-input': {
                      fontSize: 'h4.fontSize',
                      textAlign: 'center',
                      color: 'text.secondary !important',
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      user?.guestId ? signInWithAuth0(user.guestId) : handleFindUser();
                    }
                  }}
                />

                <TextField
                  fullWidth
                  disabled={false}
                  autoComplete={'off'}
                  value={user?.firstName}
                  label="First Name"
                  onChange={(e) => userActions.setUser({ ...user, firstName: e.target.value })}
                  variant="outlined"
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
                      user?.guestId ? signInWithAuth0(user.guestId) : handleFindUser();
                    }
                  }}
                />
              </>
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
              onClick={() => (user?.guestId ? signInWithAuth0(user.guestId) : handleFindUser())}
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
          <StephsFavoriteTypography mx="auto">OR</StephsFavoriteTypography>
          <Card sx={{ width: '100%', mt: 2, pb: 2 }}>
            <CardHeader subheader="Login with your existing account" />
            <CardActions>
              <Button
                fullWidth
                color="primary"
                variant="contained"
                onClick={() => {
                  auth0User
                    ? logOutFromAuth0()
                    : user.guestId
                      ? signInWithAuth0(user.guestId)
                      : console.log('no guestId');
                }}
              >
                {auth0User ? 'Logout' : 'Login'}
              </Button>
            </CardActions>
          </Card>
        </>
      )}
    </Box>
  );
};
