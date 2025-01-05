import React from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  findUserState,
  firstNameState,
  invitationButtonSelectorState,
  invitationCodeState,
} from '@/store/invitationInputs';
import { userState } from '@/store/user';
import { useQuery } from '@tanstack/react-query';
import { useApiContext } from '@/context/ApiContext';

export const InvitationCodeInputs = () => {
  const { api } = useApiContext();
  const [invitationCode, setInvitationCode] = useRecoilState(invitationCodeState);
  const [firstName, setFirstName] = useRecoilState(firstNameState);
  const [user, setUser] = useRecoilState(userState);
  const [findUser, setFindUser] = useRecoilState(findUserState);

  const queryKey = `invitationCode=${invitationCode}&firstName=${firstName}`;

  const findUserQuery = useQuery({
    queryKey: [`findUserQuery`, queryKey],
    queryFn: () => api.findUser(queryKey),
    retry: false,
    enabled: findUser,
  });

  const handleFindUser = () => {
    if (invitationCode && firstName) {
      setFindUser(true);
    }
  };

  const invitationButtonText = useRecoilValue(invitationButtonSelectorState);

  if (user?.auth0Id) {
    return (
      <Button
        color="warning"
        variant="outlined"
      >
        Let&#39;s get started
      </Button>
    );
  }

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
      <Button disabled={!firstName || !invitationCode || !!user?.auth0Id} fullWidth
              variant="contained" onClick={() => handleFindUser()}>
        {invitationButtonText}
      </Button>
    </form>
  );
};
