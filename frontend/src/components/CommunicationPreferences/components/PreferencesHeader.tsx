import { Box, Typography, useTheme, Divider } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

interface PreferencesHeaderProps {
  isUnder13: boolean;
}

export const PreferencesHeader = ({ isUnder13 }: PreferencesHeaderProps) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        textAlign: 'center',
        mb: 2
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1,
          mb: 1
        }}
      >
        <MarkEmailReadIcon color="primary" />
        <Typography variant="h5" fontWeight="600" color="primary">
          Communication Preferences
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2, width: '40%', mx: 'auto', opacity: 0.6 }} />
      
      {isUnder13 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Communication preferences are not available for guests under 13 years old.
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: '600px', mx: 'auto' }}>
          We promise not to spam you! Unless you're getting close to the RSVP date and haven't responded, 
          then you deserve a nag, you troublemaker.
        </Typography>
      )}
    </Box>
  );
};