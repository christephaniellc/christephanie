import { Box, Avatar, Typography, Chip, useTheme } from '@mui/material';
import { RsvpEnum } from '@/types/api';
import { getRsvpStatusColor, getRsvpStatusIcon } from './AdminHelpers';
import { themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';

interface GuestStatusItemProps {
  guest: any;
  onClick: (event: React.MouseEvent<HTMLElement>, guestId: string) => void;
}

const GuestStatusItem = ({ guest, onClick }: GuestStatusItemProps) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
        borderRadius: 1,
        backgroundColor: guest.rsvp?.wedding === RsvpEnum.Attending 
          ? themePaletteToRgba(theme.palette.success.main, 0.3)
          : guest.rsvp?.wedding === RsvpEnum.Declined
            ? themePaletteToRgba(theme.palette.error.main, 0.3)
            : themePaletteToRgba(theme.palette.warning.main, 0.2),
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 0 10px ${themePaletteToRgba(theme.palette.primary.main, 0.5)}`,
          transform: 'scale(1.02)',
        },
        border: '1px solid',
        borderColor: guest.rsvp?.wedding === RsvpEnum.Attending 
          ? 'success.main' 
          : guest.rsvp?.wedding === RsvpEnum.Declined
            ? 'error.main'
            : 'warning.main',
        backdropFilter: 'blur(8px)'
      }}
      onClick={(e) => onClick(e, guest.guestId as string)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar 
          sx={{ 
            width: 28, 
            height: 28, 
            bgcolor: getRsvpStatusColor(guest.rsvp?.wedding),
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
        <Chip 
          size="small"
          label="Wedding"
          icon={getRsvpStatusIcon(guest.rsvp?.wedding)}
          sx={{ 
            backgroundColor: theme.palette.mode === 'dark' 
              ? `${getRsvpStatusColor(guest.rsvp?.wedding)}70` 
              : `${getRsvpStatusColor(guest.rsvp?.wedding)}40`,
            color: getRsvpStatusColor(guest.rsvp?.wedding)
          }}
        />
      </Box>
    </Box>
  );
};

export default GuestStatusItem;