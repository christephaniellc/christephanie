import { Typography } from '@mui/material';
import { Stack, useTheme } from '@mui/system';
import { StephsActualFavoriteTypographyAppVersion } from '../AttendanceButton/AttendanceButton';
import { useEffect, useState } from 'react';

function AppVersionFooter() {
  const applicationVersion = import.meta.env.VITE_APP_VERSION || 'development';
  const [branchName, setBranchName] = useState<string>('');
  const isDevelopment = applicationVersion === 'development';
  
  // Get branch name from environment variable
  useEffect(() => {
    // Cast to string and handle undefined or null values
    const envBranch = (import.meta.env.VITE_GIT_BRANCH as string | undefined) || '';
    setBranchName(envBranch !== 'unknown' ? envBranch : '');
  }, []);
  
  const displayVersion = isDevelopment && branchName ? branchName : applicationVersion;
  const theme = useTheme();

  // Apply special styling for branch name in development
  const versionStyle = isDevelopment && branchName
    ? {
        fontSize: '10px',
        px: 1,
        pb: 0.25,
        background: 'rgba(0,0,0,.3)',
        borderRadius: 1,
        backdropFilter: 'blur(8px)',
        fontStyle: 'italic',
        // color: theme.palette.primary.main,

        fontWeight: 'bold',
      }
    : {
        fontSize: '10px',
        background: "transparent",
      };
  
  return (
    <Stack
      sx={{
        width: '100%',
        position: "relative",
        zIndex: 130,
        pr: 0.5,
        background: "transparent",
        textAlign: 'right', // Ensure text is right-aligned
        pointerEvents: 'auto', // Make text clickable
        mr: 1 // Add more margin on the right
      }}
    >
      <Typography 
        variant="caption" 
        component={StephsActualFavoriteTypographyAppVersion} 
        ml='auto'
        sx={{
          ...versionStyle,
          opacity: 0.95, // Increase opacity for better visibility
          px: 1.5, // Increase horizontal padding
          py: 0.5, // Add vertical padding
          borderRadius: 1, // Add border radius
          // Add subtle background if not in development mode
          ...(!isDevelopment && {
            backgroundColor: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
          })
        }}
      >
        {isDevelopment && branchName ? `Branch: ${displayVersion}` : `Build: ${displayVersion}`}
      </Typography>
    </Stack>
  );
}

export default AppVersionFooter;
