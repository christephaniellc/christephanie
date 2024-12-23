import { Typography } from '@mui/material';
import { useRSVP } from '../context/Providers/AppState/Wedding/Rsvp/useRSVP';
import { useRsvpContext } from '../context/Providers/AppState/Wedding/Rsvp/RsvpContext';

export const ReactSucks = () => {
  const { invitationCode } = useRsvpContext();
  return (
    <Typography variant="h1" color="text.primary">
      {invitationCode}
    </Typography>);
};