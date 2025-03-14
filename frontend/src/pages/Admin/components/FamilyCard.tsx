import { 
  Card, CardHeader, CardContent, Divider, 
  Box, Typography, Chip, Paper, Stack, Grid, useTheme,
  IconButton, Collapse, AvatarGroup, Tooltip
} from '@mui/material';
import { useState } from 'react';
import { rgba } from 'polished';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PeopleIcon from '@mui/icons-material/People';

import { FamilyUnitDto, FamilyUnitViewModel } from '@/types/api';
import { getFamilyStatusColor } from './AdminHelpers';
import GuestStatusItem from './GuestStatusItem';
import TierSquare from './TierSquare';

interface FamilyCardProps {
  family: FamilyUnitDto;
  onGuestClick: (event: React.MouseEvent<HTMLElement>, guestId: string) => void;
}

const FamilyCard = ({ family, onGuestClick }: FamilyCardProps) => {
  const theme = useTheme();
  const statusColor = getFamilyStatusColor(family);
  const [expanded, setExpanded] = useState(false);
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Maximum number of avatars to show in the header
  const MAX_AVATARS = 4;
  const hasMoreGuests = family.guests && family.guests.length > MAX_AVATARS;

  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%',
        backgroundColor: `${statusColor}95`, // 95% opacity for better contrast
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[10],
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          backgroundColor: statusColor,
        },
        display: 'flex',
        flexDirection: 'column',
        maxHeight: expanded ? '550px' : '180px', // Adjust height based on expanded state
      }}
      data-testid="family-card"
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TierSquare tier={family.tier} />
            <Typography variant="h6" component="div">
              {family.unitName}
            </Typography>
            <Chip 
              label={family.invitationCode} 
              size="small" 
              sx={{ 
                fontFamily: 'monospace',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
              }} 
            />
          </Box>
        }
        action={
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            data-testid="expand-button"
          >
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        }
        sx={{ pb: 1 }}
      />
      
      <Divider />
      
      {/* Show avatars in collapsed state */}
      {!expanded && family.guests && family.guests.length > 0 && (
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexGrow: 1
          }}
          data-testid="family-card-avatars"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon color="action" />
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Family Members
            </Typography>
          </Box>
          <AvatarGroup max={MAX_AVATARS} sx={{ ml: 2 }}>
            {family.guests.map(guest => (
              <Tooltip 
                title={`${guest.firstName} ${guest.lastName}`} 
                key={guest.guestId}
                data-testid={`guest-avatar-${guest.guestId}`}
              >
                <span> {/* Wrapper needed for Tooltip + disabled elements */}
                  <GuestStatusItem 
                    guest={guest} 
                    onClick={onGuestClick} 
                    compact={true} 
                  />
                </span>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>
      )}
      
      {/* Expanded content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ overflowY: 'auto', flexGrow: 1 }}>
          <Stack spacing={2}>
            {/* Family members with RSVP status */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: rgba(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(20px)',
                borderRadius: 1,
                maxHeight: '300px',
                overflow: 'auto'
              }}
              data-testid="family-members-section"
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Family Members
              </Typography>
              <Grid container spacing={1}>
                {family.guests?.map(guest => (
                  <Grid item xs={12} key={guest.guestId}>
                    <GuestStatusItem 
                      guest={guest} 
                      onClick={onGuestClick} 
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
            
            {/* Address */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: rgba(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(20px)',
                borderRadius: 1,
                display: 'flex',
                gap: 1
              }}
            >
              <HomeIcon color="action" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Mailing Address
                </Typography>
                <Typography variant="body2">
                  {family.mailingAddress ? (
                    <>
                      {family.mailingAddress.streetAddress}<br />{family.mailingAddress.secondaryAddress !== null 
                        ? family.mailingAddress.secondaryAddress 
                        : ''}
                      {family.mailingAddress.secondaryAddress !== undefined && <br/>}
                      {family.mailingAddress.city}, {family.mailingAddress.state} {family.mailingAddress.postalCode}
                    </>
                  ) : (
                    <Typography variant="body2" color="error">
                      No address provided
                    </Typography>
                  )}
                </Typography>
              </Box>
            </Paper>
            
            {/* Last login */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: rgba(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(20px)',
                borderRadius: 1,
                display: 'flex',
                gap: 1
              }}
            >
              <CalendarMonthIcon color="action" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Last Activity
                </Typography>
                <Typography variant="body2">
                  {family.familyUnitLastLogin 
                    ? new Date(family.familyUnitLastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Never logged in'}
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default FamilyCard;