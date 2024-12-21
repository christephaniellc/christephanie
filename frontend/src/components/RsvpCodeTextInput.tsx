import { Button, TextField } from '@mui/material';
import { useRsvpContext } from '../context/Rsvp/RsvpContext';
import { useRouteHistory } from '../context/AppState/useRouteHistory';

export const RsvpCodeTextInput = () => {
  const { error, invitationCode, firstName, handleChange, getFamilyQuery } = useRsvpContext();
  return (
    <form>
      <TextField
        value={invitationCode}
        label="Enter your Invitation Code"
        onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, 'rsvpCode')}
        variant="outlined"
        error={!!error}
        helperText={
          invitationCode.length < 5 && error
        }
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
        onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, 'firstName')}
        variant="outlined"
        error={!!error}
        helperText={
          invitationCode.length < 5 && error
        }
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
              onClick={() => getFamilyQuery.mutate({ inviteCode: invitationCode, firstName: firstName })}>Retrieve
        Invitation</Button>
    </form>
  );
};