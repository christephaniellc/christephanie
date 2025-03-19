import { LogoutOptions, useAuth0 } from '@auth0/auth0-react';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isAdmin } from '@/utils/roles';
import { ApiContext } from '@/context/ApiContext';
import { GuestDto } from '@/types/api';
import { Box, Button, Container, CircularProgress, Typography, Paper, Divider } from '@mui/material';

// Default export for the page
export default function ProfilePage() {
  return <Profile />;
}

export function Profile() {
  const { isAuthenticated, user, isLoading, loginWithRedirect, logout } = useAuth0();
  const guest = useRecoilValue(userState);
  const location = useLocation();
  const apiContext = useContext(ApiContext);
  const [userMeData, setUserMeData] = useState<GuestDto | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useRecoilValue(userState);
  const userIsAdmin = isAdmin(currentUser);
  const isGetMePage = location.pathname === '/getme';

  // Load user data for the GetMe page
  useEffect(() => {
    if (isGetMePage && userIsAdmin && apiContext && apiContext.getMeQuery) {
      setIsLoadingUserData(true);
      setError(null);
      
      apiContext.getMeQuery.refetch()
        .then(response => {
          if (response.data) {
            setUserMeData(response.data);
          } else if (response.error) {
            setError('Failed to fetch user data: ' + response.error.error);
          }
        })
        .catch(err => {
          setError('An error occurred: ' + (err.message || String(err)));
          console.error('GetMe error:', err);
        })
        .finally(() => {
          setIsLoadingUserData(false);
        });
    }
  }, [isGetMePage, userIsAdmin, apiContext]);

  const refreshUserData = () => {
    if (apiContext && apiContext.getMeQuery) {
      setIsLoadingUserData(true);
      setError(null);
      
      apiContext.getMeQuery.refetch()
        .then(response => {
          if (response.data) {
            setUserMeData(response.data);
          } else if (response.error) {
            setError('Failed to fetch user data: ' + response.error.error);
          }
        })
        .catch(err => {
          setError('An error occurred: ' + (err.message || String(err)));
        })
        .finally(() => {
          setIsLoadingUserData(false);
        });
    }
  };

  if (isLoading || isLoadingUserData) {
    return (
      <Container sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>You're not authenticated</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => loginWithRedirect({ 
            authorizationParams: {
              state: JSON.stringify({guest_id: guest?.guestId })
            }
          })}
        >
          Log In
        </Button>
      </Container>
    );
  }

  // For the GetMe admin page
  if (isGetMePage && userIsAdmin) {
    return (
      <Container sx={{ mt: 4, mb: 10 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            GetMe API Data
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This page displays the raw user data from the getMe API endpoint.
          </Typography>
          
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={refreshUserData}
            sx={{ mb: 2 }}
          >
            Refresh Data
          </Button>
          
          {error && (
            <Typography variant="body2" color="error" sx={{ my: 2 }}>
              {error}
            </Typography>
          )}
          
          {userMeData && (
            <Paper sx={{ p: 3, mt: 2, backgroundColor: 'rgba(0,0,0,0.03)', overflow: 'auto', maxHeight: '70vh' }}>
              <Typography variant="h6" gutterBottom>User Details</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Basic Info</Typography>
                <Typography variant="body2">ID: {userMeData.guestId}</Typography>
                <Typography variant="body2">Name: {userMeData.firstName} {userMeData.lastName}</Typography>
                <Typography variant="body2">Auth0 ID: {userMeData.auth0Id}</Typography>
                {userMeData.email && <Typography variant="body2">Email: {userMeData.email.value}</Typography>}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Roles</Typography>
                {userMeData.roles && userMeData.roles.length > 0 ? (
                  userMeData.roles.map((role, index) => (
                    <Typography key={index} variant="body2">• {role}</Typography>
                  ))
                ) : (
                  <Typography variant="body2">No roles assigned</Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">RSVP</Typography>
                {userMeData.rsvp ? (
                  <>
                    <Typography variant="body2">Status: {userMeData.rsvp.invitationResponse}</Typography>
                    {userMeData.rsvp.invitationResponseAudit && (
                      <Typography variant="body2">
                        Last Updated: {new Date(userMeData.rsvp.invitationResponseAudit.lastUpdate).toLocaleString()}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body2">No RSVP data</Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Preferences</Typography>
                {userMeData.preferences ? (
                  <>
                    {userMeData.preferences.foodPreference && (
                      <Typography variant="body2">Food: {userMeData.preferences.foodPreference}</Typography>
                    )}
                    
                    {userMeData.preferences.foodAllergies && userMeData.preferences.foodAllergies.length > 0 && (
                      <Typography variant="body2">
                        Allergies: {userMeData.preferences.foodAllergies.join(', ')}
                      </Typography>
                    )}
                    
                    {userMeData.preferences.sleepPreference && (
                      <Typography variant="body2">Accommodation: {userMeData.preferences.sleepPreference}</Typography>
                    )}
                    
                    {userMeData.preferences.notificationPreference && userMeData.preferences.notificationPreference.length > 0 && (
                      <Typography variant="body2">
                        Notifications: {userMeData.preferences.notificationPreference.join(', ')}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body2">No preferences data</Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="subtitle2">Raw Data</Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(0,0,0,0.1)', 
                    borderRadius: 1, 
                    overflow: 'auto',
                    fontSize: '0.75rem'
                  }}
                >
                  {JSON.stringify(userMeData, null, 2)}
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    );
  }

  // For the regular profile page
  return (
    <Container sx={{ mt: 8 }}>
      <Box>
        <Typography variant="h2" gutterBottom>
          Profile
        </Typography>
        {user?.picture && (
          <Box
            component="img"
            sx={{
              height: 128,
              width: 128,
              mb: 2,
              borderRadius: '50%',
            }}
            alt="User profile"
            src={user.picture}
          />
        )}
        <Typography variant="h6">{user?.name || 'User'}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {user?.email}
        </Typography>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={() => logout({ returnTo: window.location.origin } as LogoutOptions)}
          sx={{ mt: 2 }}
        >
          Log Out
        </Button>
      </Box>
    </Container>
  );
}