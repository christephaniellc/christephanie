import React, { useMemo } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useRecoilState } from 'recoil';
import { firstNameState, invitationCodeState } from '@/store/invitationInputs';
import useUser from '@/store/user';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export const InvitationCodeInputs = () => {
  const [invitationCode, setInvitationCode] = useRecoilState(invitationCodeState);
  const [firstName, setFirstName] = useRecoilState(firstNameState);
  const { user: auth0User } = useAuth0();
  const [_user, actions] = useUser();
  const { findUserMutation} = actions;
  const navigate = useNavigate();
  const handleFindUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    findUserMutation.mutate();
  }

  const createAcctButtonText = useMemo(() => {
    if (auth0User) return "Account Created!"
    if (findUserMutation.data) return "Please sign in"
    if (findUserMutation.status === "idle") return "Create Account"
    if (findUserMutation.status === "pending") return "Checking guest list"
    if (findUserMutation.status === 'error') return `No matching invitation found`
  }, [findUserMutation, auth0User])

  // useEffect(() => {
  //   if (auth0User) {
  //     navigate('/save-the-date');
  //   }
  // }, [auth0User]);

  if (auth0User) return <Button color="warning" variant="outlined" onClick={() => navigate('/save-the-date')}>Let&#39;s get started</Button>

  return (
    <form>
      <Typography variant="h6" color="text.primary" gutterBottom mt={4} data-testid={'invitation-code'}>
        Please enter your invitation code to get started.
      </Typography>
      <TextField
        fullWidth
        value={invitationCode}
        label="Enter your Invitation Code"
        onChange={(e) => setInvitationCode(e.target.value)}
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
        value={firstName}
        label="First Name"
        onChange={(e) => setFirstName(e.target.value)}
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
      <Button
        type="submit" disabled={!firstName || !invitationCode || !!auth0User} fullWidth variant="contained"
              onClick={handleFindUser}>{createAcctButtonText}</Button>
    </form>
  );
};