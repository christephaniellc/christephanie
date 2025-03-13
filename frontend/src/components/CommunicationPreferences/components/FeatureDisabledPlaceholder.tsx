import { Box, Typography } from '@mui/material';
import { ConstructionOutlined } from '@mui/icons-material';

export const FeatureDisabledPlaceholder = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      textAlign="center"
      sx={{
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 2,
        border: '1px dashed rgba(255,255,255,0.2)',
        width: '100%',
        height: '100%'
      }}
    >
      <ConstructionOutlined sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
      <Typography variant="h6" color="warning.main" gutterBottom>
        Coming Soon
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Communication preferences will be available in the next release.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
        We're working on connecting with our communication services to provide you with email and SMS updates.
      </Typography>
    </Box>
  );
};