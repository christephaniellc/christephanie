import React from 'react';
import { Button, TextField } from '@mui/material';
import { useRecoilState } from 'recoil';
import { firstNameState, invitationCodeState } from '@/store/invitationInputs';
import useUser from '@/store/user';

export const InvitationCodeInputs = () => {
  const [invitationCode, setInvitationCode] = useRecoilState(invitationCodeState);
  const [firstName, setFirstName] = useRecoilState(firstNameState);

  const [_user, findUserMutation] = useUser();

  const handleFindUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    findUserMutation.mutate();
  }

  return (
    <form>
      <TextField
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
      <Button type="submit" disabled={!firstName || !invitationCode} fullWidth variant="contained"
              onClick={handleFindUser}>Create Account</Button>
    </form>
  );
};