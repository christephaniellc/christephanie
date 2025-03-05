import { forwardRef, Ref } from 'react';
import { CustomContentProps } from 'notistack';
import { Alert, AlertTitle } from '@mui/material';
import { CustomVariant } from '@/store/notifications/types';
import { useTheme } from '@mui/material/styles';

// Define props type without extending CustomContentProps to avoid conflict
interface CustomNotificationProps {
  message?: React.ReactNode;
  variant: string;
  title?: string;
  id?: string | number;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  [key: string]: any; // Allow other props from notistack
}

const CustomNotification = forwardRef(function CustomNotification(
  { message, variant = 'info', title, onClick }: CustomNotificationProps,
  ref: Ref<HTMLDivElement>,
) {
  const theme = useTheme();
  
  // Map our custom variants to styling
  const getStylesForVariant = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        };
      case 'secondary':
        return {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        };
      case 'error':
        return {
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
        };
      default:
        return {}; // Use built-in Alert styles for default variants
    }
  };
  
  // Determine which severity to use (standard variants map directly to severities)
  const getSeverity = () => {
    if (['primary', 'secondary'].includes(variant)) {
      return 'info'; // Use info as base for custom variants
    }
    
    // For built-in variants, map directly
    return variant as 'info' | 'success' | 'warning' | 'error';
  };
  
  // Apply special styling for SW update notifications
  const isUpdateNotification = message && typeof message === 'string' && 
    message.includes('New content is available');
  
  return (
    <Alert 
      ref={ref} 
      severity={getSeverity()}
      onClick={onClick}
      sx={{
        ...getStylesForVariant(),
        // Apply special styling for update notifications
        ...(isUpdateNotification ? {
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          color: theme.palette.common.white,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 15px rgba(0,0,0,0.5)',
          marginBottom: '15px',
          '& .MuiAlert-icon': {
            color: theme.palette.common.white,
          },
          '& .MuiAlert-message': {
            color: theme.palette.common.white,
          },
          '& .MuiButton-root': {
            color: theme.palette.primary.light,
            borderColor: theme.palette.primary.light,
          }
        } : {}),
        '& .MuiAlert-icon': {
          // Ensure icon has good contrast with custom colors (for non-update notifications)
          color: !isUpdateNotification && ['primary', 'secondary', 'error'].includes(variant) 
            ? theme.palette.common.white 
            : undefined,
        },
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
});

export default CustomNotification;