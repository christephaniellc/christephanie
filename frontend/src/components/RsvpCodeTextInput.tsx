import { TextField } from '@mui/material';
import { useRsvpContext } from '../context/Rsvp/RsvpContext';

export const RsvpCodeTextInput = () => {
  const { error, rsvpCode, handleChange } = useRsvpContext();
  return (
    <TextField
      value={rsvpCode}
      label="Enter your RSVP Code"
      onChange={handleChange}
      inputProps={{ maxLength: 5 }}
      variant="outlined"
      error={!!error}
      helperText={
        rsvpCode.length < 5 && error
      }
      sx={{
        '& .MuiInputBase-input': {
          fontSize: 'h4.fontSize',
          textAlign: 'center',
          color: 'text.secondary !important',
        },
      }}
    />
  );
};