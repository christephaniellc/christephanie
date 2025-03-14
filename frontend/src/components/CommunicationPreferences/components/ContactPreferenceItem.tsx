import { useMemo } from 'react';
import { 
  Box,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  useTheme,
  alpha,
  Switch,
  Button,
  Typography
} from '@mui/material';
import { 
  EmailOutlined, 
  PhoneAndroid, 
  EditOutlined, 
  VerifiedUser, 
  ErrorOutline, 
  ConstructionOutlined,
  CheckCircleOutline
} from '@mui/icons-material';

interface ContactPreferenceItemProps {
  value: string;
  isEnabled: boolean;
  isVerified: boolean;
  needsVerification: boolean;
  isComingSoon: boolean;
  contactValue: string | undefined;
  isPending: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export const ContactPreferenceItem = ({
  value,
  isEnabled,
  isVerified,
  needsVerification,
  isComingSoon,
  contactValue,
  isPending,
  onToggle,
  onEdit
}: ContactPreferenceItemProps) => {
  const theme = useTheme();
  const isEmail = value === 'Email';
  
  const icon = useMemo(() => 
    isEmail ? <EmailOutlined /> : <PhoneAndroid />
  , [isEmail]);
  
  // Status indicators
  const statusColor = isEnabled
    ? isVerified 
      ? 'success.main'
      : 'error.main'
    : 'text.disabled';
    
  const statusIcon = isEnabled
    ? isVerified
      ? <CheckCircleOutline fontSize="small" color="success" />
      : <ErrorOutline fontSize="small" color="error" />
    : null;
    
  const statusText = isEnabled
    ? isVerified
      ? 'Verified'
      : 'Verification needed'
    : 'Disabled';
  
  return (
    <ListItem 
      disablePadding
      sx={{
        mb: 1,
        px: 1
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
          transition: 'all 0.2s ease',
          bgcolor: isEnabled 
            ? isVerified 
              ? alpha(theme.palette.success.main, 0.05)
              : alpha(theme.palette.error.main, 0.05)
            : alpha(theme.palette.background.paper, 0.6),
          '&:hover': {
            bgcolor: isEnabled 
              ? isVerified 
                ? alpha(theme.palette.success.main, 0.08)
                : alpha(theme.palette.error.main, 0.08)
              : alpha(theme.palette.background.paper, 0.8),
            boxShadow: isEnabled ? 1 : 0
          }
        }}
      >
        {/* Card header */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            pb: 1,
            borderBottom: isEnabled ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: isEnabled 
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.text.secondary, 0.1),
                color: isEnabled 
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                mr: 1.5
              }}
            >
              {icon}
            </Avatar>
            
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                {value}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                {statusIcon && (
                  <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {statusIcon}
                  </Box>
                )}
                <Typography 
                  variant="caption"
                  sx={{ 
                    color: statusColor,
                    fontWeight: 500
                  }}
                >
                  {statusText}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Switch
            checked={isEnabled}
            disabled={isPending}
            onChange={onToggle}
            color={isVerified ? 'success' : 'primary'}
            size="medium"
          />
        </Box>
        
        {/* Card content - only shown if enabled */}
        {isEnabled && (
          <Box 
            sx={{ 
              p: 1.5,
              pt: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 0.5
                }}
              >
                Current {isEmail ? 'email' : 'phone'}:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  wordBreak: 'break-all'
                }}
              >
                {contactValue || 'Not set'}
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={onEdit}
              startIcon={<EditOutlined />}
              sx={{ 
                ml: 1,
                whiteSpace: 'nowrap',
                minWidth: 'auto'
              }}
            >
              Edit
            </Button>
          </Box>
        )}
        
        {/* Coming soon badge - show only if relevant */}
        {isComingSoon && (
          <Box sx={{ position: 'absolute', top: 8, right: 56 }}>
            <Chip
              label="Coming Soon"
              size="small"
              color="info"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          </Box>
        )}
      </Box>
    </ListItem>
  );
};