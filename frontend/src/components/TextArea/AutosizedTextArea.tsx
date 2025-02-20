import * as React from 'react';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import { FormControl, FormLabel, Button, Box, CircularProgress } from '@mui/material';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { ApiError } from '@/api/Api';
import { useRecoilState } from 'recoil';
import { userCommentState } from '@/store/userComment/userComment';
import { useFamily } from '@/store/family';
import { FamilyUnitDto } from '@/types/api';
import { useEffect } from 'react';

// Mock "send" function that simulates an async request
async function postComment(comment) {
  // This could be a fetch/axios call; we'll simulate delay:
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: `Server received: ${comment}` });
    }, 2000);
  });
}

const blue = {
  100: '#DAECFF',
  200: '#b6daff',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

export default function BetterTextField() {
  console.log('steelin your focus');
  const [comment, setComment] = useRecoilState(userCommentState);
  const [family, familyActions] = useFamily();
  // Styled MUI BaseTextareaAutosize

  useEffect(() => {
    familyActions.updateFamilyMutation.reset();
  }, [comment]);

  const mutationState: UseMutationResult<FamilyUnitDto, ApiError> = familyActions.updateFamilyMutation
  // Handler to invoke the query
  const handleSend = () => {
    // Clear any previous data if you wish, or handle it differently
    familyActions.updateFamilyComment(comment);
  };

  const isFetching = mutationState.status === 'pending';
  const isSuccess = mutationState.status === 'success';
  const isError = mutationState.status === 'error';
  const isIdle = mutationState.status === 'idle';
  const error = mutationState.error;
  const isUnchanged = family?.invitationResponseNotes === comment;
  const data = mutationState.data;

  useEffect(() => {
    if (family?.invitationResponseNotes) {
      setComment(family.invitationResponseNotes);
    }
  }, [family, setComment]);

  return (
    <FormControl sx={{ width: 350 }}>
      <FormLabel sx={{ mb: 1 }}>Your comment</FormLabel>
      <Textarea
        aria-label="minimum height"
        minRows={3}
        placeholder={family?.invitationResponseNotes || 'Tell us your feelings...'}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isFetching || familyActions.getFamilyUnitQuery.isFetching}
      />

      {/* Row for the send button and any extra info */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSend}
          disabled={mutationState.status === 'pending' || !comment || familyActions.getFamilyUnitQuery.isFetching}
        >
          {isError ? `${error}` : ''}
          {isFetching ? 'Sending...' : ''}
          {isIdle && !isUnchanged ? 'Send' : ''}
          {(isIdle || isSuccess) && isUnchanged ? 'Sent!' : ''}
        </Button>
      </Box>

      {/* Show a loading indicator or results */}
      {isFetching && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <span>Sending your comment...</span>
        </Box>
      )}
      {isError && (
        <Box sx={{ color: 'error.main', mt: 1 }}>
          Error: {(error as ApiError)?.description || 'Something went wrong.'}
        </Box>
      )}
      {!!data && !isFetching && (
        <Box sx={{ color: 'success.main', mt: 1 }}>
          Successfully sent! Response: {family?.invitationResponseNotes}
        </Box>
      )}
    </FormControl>
  );
}

const Textarea = styled(BaseTextareaAutosize)(
  ({ theme }) => `
      box-sizing: border-box;
      width: 320px;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5;
      padding: 8px 12px;
      border-radius: 8px;
      color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
      background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
      border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
      box-shadow: 0 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
    
      &:hover {
        border-color: ${blue[400]};
      }

      &:focus {
        border-color: ${blue[400]};
        box-shadow: 0 0 0 3px ${
    theme.palette.mode === 'dark' ? blue[600] : blue[200]
  };
      }

      /* firefox */
      &:focus-visible {
        outline: 0;
      }
    `,
);
