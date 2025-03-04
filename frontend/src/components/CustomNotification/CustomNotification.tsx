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
  [key: string]: any; // Allow other props from notistack
}

const CustomNotification = forwardRef(function CustomNotification(
  { message, variant = 'info', title }: CustomNotificationProps,
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
  
  return (
    <Alert 
      ref={ref} 
      severity={getSeverity()}
      sx={{
        ...getStylesForVariant(),
        '& .MuiAlert-icon': {
          // Ensure icon has good contrast with custom colors
          color: ['primary', 'secondary', 'error'].includes(variant) 
            ? theme.palette.common.white 
            : undefined,
        }
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
});

export default CustomNotification;