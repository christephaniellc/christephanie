import React, { useEffect } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  TextField,

} from '@mui/material';
import { useRecoilValue } from 'recoil';
import {
  invitationButtonSelectorState,

} from '@/store/invitationInputs';
import { useUser } from '@/store/user';
import { useApiContext } from '@/context/ApiContext';
import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { useAuth0Queries } from '@/hooks/useAuth0Queries';


export const InvitationCodeInputs = () => {
  const  api = useApiContext();
  const [user, userActions] = useUser();
  const invitationButtonText = useRecoilValue(invitationButtonSelectorState);

  const handleFindUser = () => {
    console.log('refetching');
    userActions.findUserIdQuery?.refetch();
  };

  const { user: auth0User } = useAuth0();
  const { getAccessTokenPleasePleasePlease, logOutFromAuth0 } = useAuth0Queries();

  useEffect(() => {
    console.log('user', user);
  }, [user]);

  if (!user) return null;

  return (
    <Card padding={3}>
      <CardHeader
        title={!user?.guestId ? 'Please enter your invitation to get started.' : `Welcome back ${user?.firstName}`}
        subheader={!api.getJwt() ? 'Please finish creating your account to get started' : ''} />
      <CardContent>
        <>
          {!user?.auth0Id &&
            <>
              <TextField
                autoComplete={'off'}
                disabled={false}
                fullWidth
                value={user?.invitationCode}
                label="Enter your Invitation Code"
                onChange={(e) => userActions.setUser({ ...user , invitationCode: e.target.value })}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    fontSize: 'h4.fontSize',
                    textAlign: 'center',
                    color: 'text.secondary !important',
                  },
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
              />
            </>
          }
        </>
      </CardContent>
      <CardActions>
        <Box display="flex" flexDirection="column" width="100%" px={1}>
          {!user?.auth0Id && <Button sx={{ width: '100%', mb: 2 }}
                                 disabled={!user?.firstName || !user?.invitationCode}
                                 fullWidth
                                 variant="contained" onClick={() =>

            user?.guestId ? getAccessTokenPleasePleasePlease() : handleFindUser()}
          >
            {invitationButtonText}
          </Button>}
          {api.getJwt() && (
            <Button
              fullWidth
              color="primary"
              variant="contained"
              onClick={() => {
                auth0User ? logOutFromAuth0() : getAccessTokenPleasePleasePlease();
              }}
            >
              {auth0User ? 'Logout' : 'Login'}
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  )
    ;
};
