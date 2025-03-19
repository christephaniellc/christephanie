import { Box, Avatar, Typography, Chip, useTheme, Tooltip } from '@mui/material';
import { InvitationResponseEnum, NotificationPreferenceEnum } from '@/types/api';
import { getInvitationStatusColor, getInvitationStatusIcon } from './AdminHelpers';
import { themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';
import EmailIcon from '@mui/icons-material/Email';

interface GuestStatusItemProps {
  guest: {
    guestId: string;
    firstName?: string;
    lastName?: string;
    rsvp?: {
      invitationResponse?: InvitationResponseEnum;
    };
    email?: {
      verified?: boolean;
    };
    preferences?: {
      notificationPreference?: NotificationPreferenceEnum[];
    };
  };
  onClick: (event: React.MouseEvent<HTMLElement>, guestId: string) => void;
  compact?: boolean; // Added for the compact avatar-only view
}

const GuestStatusItem = ({ guest, onClick, compact = false }: GuestStatusItemProps) => {
  const theme = useTheme();
  const responseStatus = guest.rsvp?.invitationResponse || InvitationResponseEnum.Pending;

  // If compact mode, just return the avatar
  if (compact) {
    return (
      <Avatar 
        sx={{ 
          width: 32, 
          height: 32, 
          bgcolor: getInvitationStatusColor(responseStatus),
          fontSize: '0.8rem',
          cursor: 'pointer',
          border: '2px solid',
          borderColor: 'background.paper',
          boxShadow: 2,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
        onClick={(e) => onClick(e, guest.guestId as string)}
        title={`${guest.firstName} ${guest.lastName}`}
      >
        {guest.firstName?.[0]}{guest.lastName?.[0]}
      </Avatar>
    );
  }

  // Full detailed view
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
        borderRadius: 1,
        backgroundColor: responseStatus === InvitationResponseEnum.Interested 
          ? themePaletteToRgba(theme.palette.success.main, 0.3)
          : responseStatus === InvitationResponseEnum.Declined
            ? themePaletteToRgba(theme.palette.error.main, 0.3)
            : themePaletteToRgba(theme.palette.warning.main, 0.2),
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 0 10px ${themePaletteToRgba(theme.palette.primary.main, 0.5)}`,
          transform: 'scale(1.02)',
        },
        border: '1px solid',
        borderColor: responseStatus === InvitationResponseEnum.Interested 
          ? 'success.main' 
          : responseStatus === InvitationResponseEnum.Declined
            ? 'error.main'
            : 'warning.main',
        backdropFilter: 'blur(8px)'
      }}
      onClick={(e) => onClick(e, guest.guestId as string)}
      data-testid="guest-status-item"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar 
          sx={{ 
            width: 28, 
            height: 28, 
            bgcolor: getInvitationStatusColor(responseStatus),
            fontSize: '0.875rem'
          }}
        >
          {guest.firstName?.[0]}{guest.lastName?.[0]}
        </Avatar>
        <Typography variant="body2">
          {guest.firstName} {guest.lastName}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {/* Email verification icon */}
        {guest.email?.verified && guest.preferences?.notificationPreference?.includes(NotificationPreferenceEnum.Email) && (
          <Tooltip title="Verified email">
            <Chip
              size="small"
              icon={<EmailIcon fontSize="small" />}
              sx={{
                backgroundColor: theme.palette.success.light,
                color: theme.palette.success.contrastText,
                '& .MuiChip-icon': {
                  color: 'inherit',
                  marginLeft: '5px',
                  marginRight: '-8px'
                },
                minWidth: 0,
                width: 'auto',
                px: 0.5
              }}
            />
          </Tooltip>
        )}
        
        {/* Status chip */}
        <Chip 
          size="small"
          label="Status"
          icon={getInvitationStatusIcon(responseStatus)}
          sx={{ 
            backgroundColor: theme.palette.mode === 'dark' 
              ? `${getInvitationStatusColor(responseStatus)}70` 
              : `${getInvitationStatusColor(responseStatus)}40`,
            color: getInvitationStatusColor(responseStatus)
          }}
        />
      </Box>
    </Box>
  );
};

export default GuestStatusItem;