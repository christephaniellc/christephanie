import { Box, Typography } from '@mui/material';

interface PreferencesHeaderProps {
  isUnder13: boolean;
}

export const PreferencesHeader = ({ isUnder13 }: PreferencesHeaderProps) => {
  return (
    <Box sx={{ px: 2, pt: 1, pb: 2 }}>
      <Typography variant="h6" fontWeight="500" gutterBottom>
        Communication Preferences
      </Typography>
      {isUnder13 ? (
        <Typography variant="body2" color="text.secondary">
          Communication preferences are not available for guests under 13 years old.
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          We promise not to spam you!<br/>Unless you're getting close to the RSVP date and haven't responded, 
          then you deserve a nag, you troublemaker.
        </Typography>
      )}
    </Box>
  );
};