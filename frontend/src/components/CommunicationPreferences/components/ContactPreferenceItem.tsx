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
  Switch
} from '@mui/material';
import { 
  EmailOutlined, 
  PhoneAndroid, 
  Edit, 
  VerifiedUser, 
  Warning, 
  ConstructionOutlined 
} from '@mui/icons-material';
import { NotificationPreferenceEnum } from '@/types/api';

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
  
  const icon = useMemo(() => 
    value === 'Email' ? <EmailOutlined /> : <PhoneAndroid />
  , [value]);
  
  return (
    <ListItem 
      disablePadding
      secondaryAction={
        <Switch
          edge="end"
          checked={isEnabled}
          disabled={isPending}
          onChange={onToggle}
          color="secondary"
        />
      }
    >
      <ListItemButton
        onClick={onEdit}
        sx={{
          border: isEnabled ? `1px solid ${theme.palette.secondary.main}` : 'none',
          backgroundColor: isEnabled && isVerified ? alpha(theme.palette.secondary.main, 0.15) : 'transparent',
          borderRadius: 1,
          mx: 0.5,
          mt: 0.5,
          mb: needsVerification ? 0 : 0.5
        }}
      >
        <ListItemAvatar>
          <Avatar 
            sx={{ 
              bgcolor: isEnabled 
                ? alpha(theme.palette.secondary.main, 0.15)
                : alpha(theme.palette.text.secondary, 0.1),
              color: isEnabled 
                ? theme.palette.secondary.main
                : theme.palette.text.secondary
            }}
          >
            {icon}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center">
              <Box component="span" fontWeight={500}>
                {value}
              </Box>
              <Box ml={1.5} display="flex" gap={0.5}> {/* Added spacing before badges */}
                {isComingSoon && (
                  <Chip
                    label="Coming Soon"
                    size="small"
                    color="info"
                    icon={<ConstructionOutlined sx={{ fontSize: '0.7rem !important' }} />}
                    sx={{ 
                      height: 20, 
                      '& .MuiChip-label': { 
                        px: 0.5, 
                        fontSize: '0.65rem' 
                      }
                    }}
                  />
                )}
                {isEnabled && isVerified && (
                  <Chip
                    label="Verified"
                    size="small"
                    color="success"
                    icon={<VerifiedUser sx={{ fontSize: '0.7rem !important' }} />}
                    sx={{ 
                      height: 20, 
                      '& .MuiChip-label': { 
                        px: 0.5, 
                        fontSize: '0.65rem' 
                      }
                    }}
                  />
                )}
                {needsVerification && (
                  <Chip
                    label="Unverified"
                    size="small"
                    color="error"
                    icon={<Warning sx={{ fontSize: '0.7rem !important' }} />}
                    sx={{ 
                      height: 20, 
                      '& .MuiChip-label': { 
                        px: 0.5, 
                        fontSize: '0.65rem' 
                      }
                    }}
                  />
                )}
              </Box>
            </Box>
          }
          secondary={
            <Box component="span" sx={{ fontSize: '0.75rem' }}>
              {contactValue || 'Not set'}
            </Box>
          }
        />
        {/* Edit icon */}
        <Edit 
          fontSize="small" 
          sx={{ 
            color: alpha(theme.palette.text.primary, 0.6),
            mr: 1.5,
            cursor: 'pointer',
            '&:hover': {
              color: theme.palette.primary.main
            }
          }} 
        />
      </ListItemButton>
    </ListItem>
  );
};