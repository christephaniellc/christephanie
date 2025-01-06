import React, { useEffect } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  firstNameState,
  invitationButtonSelectorState,
  invitationCodeState, queryKeySelector,
} from '@/store/invitationInputs';
import { userSelector, userIdQueryState } from '@/store/user';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useApiContext } from '@/context/ApiContext';


export const InvitationCodeInputs = () => {
  const { api } = useApiContext();
  const [invitationCode, setInvitationCode] = useRecoilState(invitationCodeState);
  const [firstName, setFirstName] = useRecoilState(firstNameState);
  const [userIdQuery, setUserIdQuery] = useRecoilState(userIdQueryState);
  const user = useRecoilValue(userSelector);
  const queryKey = useRecoilValue(queryKeySelector);
  const invitationButtonText = useRecoilValue(invitationButtonSelectorState);

  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`findUserQuery`, `${queryKey}`],
    queryFn: () => api.findUser(queryKey),
    retry: false,
    enabled: false,
  });

  const handleFindUser = () => {
    queryResult.refetch();
  };

  useEffect(() => {
    if (queryResult.isPending || queryResult.isError || queryResult.data || queryResult.isFetching) {
      setUserIdQuery(queryResult as UseQueryResult<string>);
    }
  }, [queryResult.data, queryResult.isPending, queryResult.isError, queryResult.isFetching, setUserIdQuery]);


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
