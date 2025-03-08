import { Typography } from '@mui/material';
import { Stack, useTheme } from '@mui/system';
import { StephsActualFavoriteTypographyAppVersion } from '../AttendanceButton/AttendanceButton';

function AppVersionFooter() {
  const applicationVersion = import.meta.env.REACT_APP_VERSION || 'development';
  const theme = useTheme();
  return (
    <Stack
          sx={{
            width: '100%',
            position: "relative",
            zIndex: 1500,
            pr: 0.5,
            background: "transparent"
          }}
        >
    <Typography variant="caption" 
      component={StephsActualFavoriteTypographyAppVersion} 
      ml='auto'
      sx={{
        fontSize: '10px',
        background: "transparent"
      }}
    >
      Version: {applicationVersion}
      </Typography>
     </Stack>
  );
}

export default AppVersionFooter;
