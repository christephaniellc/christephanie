import { 
  Card, CardHeader, CardContent, Divider, 
  Box, Typography, Chip, Paper, Stack, Grid, useTheme,
  IconButton, Collapse, AvatarGroup, Tooltip, Button
} from '@mui/material';
import { useState } from 'react';
import { rgba } from 'polished';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedIcon from '@mui/icons-material/Verified';
import PublicIcon from '@mui/icons-material/Public';
import EmailIcon from '@mui/icons-material/Email';
import FlareIcon from '@mui/icons-material/Flare';

// Import flag SVGs
import FlagUS from '@/assets/flags/us.svg';
import FlagCA from '@/assets/flags/ca.svg';
import FlagDE from '@/assets/flags/de.svg';
import FlagNO from '@/assets/flags/no.svg';
import FlagMX from '@/assets/flags/mx.svg';
import FlagTH from '@/assets/flags/th.svg';

import { FamilyUnitDto, InvitationResponseEnum, RsvpEnum } from '@/types/api';
import { getFamilyStatusColor, getLatestActivityAndGuest, GuestPopperState } from '../../Stats/components/StatsHelpers';
import GuestStatusItem from '../../Stats/components/GuestStatusItem';
import TierSquare from '../../Stats/components/TierSquare';
import React from 'react';

interface AdminFamilyCardProps {
  family: FamilyUnitDto;
  onGuestClick: (event: React.MouseEvent<HTMLElement>, guestId: string) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

// export const getRandomAxis = () => {
//   const axes = ['X', 'Y'];
//   return axes[Math.floor(Math.random() * axes.length)];
// };

// const handleClosePopper = () => {
//   setPopperState({
//     ...popperState,
//     open: false
//   });
// };

// const [popperState, setPopperState] = useState<GuestPopperState>({
//   open: false,
//   anchorEl: null,
//   guestId: null,
//   flipped: false,
//   flipAxis: 'Y'
// });

const AdminFamilyCard = ({ family, onGuestClick, expanded, onToggleExpanded }: AdminFamilyCardProps) => {
  const theme = useTheme();
  const statusColor = getFamilyStatusColor(family);
  const lastGuestActivity = getLatestActivityAndGuest(family);
  
  // Check how many guests are attending the 4th
  const numberFourthAttendees = family.guests?.filter(g => 
      g.rsvp?.fourthOfJuly === RsvpEnum.Attending
    ).length;

  // Check if any guest in family has a verified email
  const hasVerifiedEmail = family.guests?.some(guest => guest.email?.verified) || false;
  
  // Check if all guests in the family have declined
  const isAllDeclined = ((family.guests || []).length > 0) 
    && (family.guests || []).every(guest => 
    guest.rsvp?.wedding === RsvpEnum.Declined
    || guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined);

  // Check if any guest is not confirmed (not attending or declined)
  const hasPendingRsvps = !isAllDeclined && family.guests?.some(guest => 
    !guest.rsvp?.wedding || 
    guest.rsvp.wedding === 'Pending'
  ) || false;
  
  // Maximum number of avatars to show in the header
  const MAX_AVATARS = 4;
  const hasMoreGuests = family.guests && family.guests.length > MAX_AVATARS;
  
  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: expanded ? 'auto' : '100%',
        backgroundColor: `${statusColor}95`, // 95% opacity for better contrast
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'visible', // Allow content to overflow
        borderRadius: 2,
        transition: 'box-shadow 0.3s ease-in-out', // Changed from 'all' to just 'box-shadow'
        '&:hover': {
          boxShadow: theme.shadows[10],
          // Removed transform to avoid layout shifts
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
        mb: 2,
        // Add dotted border for pending RSVPs
        border: hasPendingRsvps ? '2px dotted' : 'none',
        borderColor: hasPendingRsvps ? theme.palette.warning.main : 'transparent',
      }}
      data-testid="family-card"
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TierSquare tier={family.tier} />
            <Typography variant="h6" component="div">
              {family.unitName}
              {/* Email verification indicator */}
              {hasVerifiedEmail && (
                <Tooltip title="Has verified email">
                  <EmailIcon 
                    fontSize="small" 
                    sx={{ 
                      color: 'success.main', 
                      verticalAlign: 'middle', 
                      ml: 1,
                      fontSize: '1rem'
                    }} 
                  />
                </Tooltip>
              )}
              {/* Address indicator */}
              {(!family.mailingAddress || !family.mailingAddress.uspsVerified) && (
                <Tooltip title={!family.mailingAddress ? "No address provided" : (family.mailingAddress.country ? `${family.mailingAddress.country} address` : "Address not verified")}>
                  {family.mailingAddress?.country ? (
                    <Box
                      component="img"
                      src={
                        family.mailingAddress.country === 'Canada' ? FlagCA :
                        family.mailingAddress.country === 'Germany' ? FlagDE :
                        family.mailingAddress.country === 'Norway' ? FlagNO :
                        family.mailingAddress.country === 'Mexico' ? FlagMX :
                        family.mailingAddress.country === 'Thailand' ? FlagTH :
                        FlagUS
                      }
                      alt={family.mailingAddress.country}
                      sx={{
                        height: '1.2rem',
                        width: 'auto',
                        verticalAlign: 'middle',
                        ml: 0.5,
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '2px'
                      }}
                    />
                  ) : (
                    <WarningAmberIcon 
                      fontSize="small" 
                      sx={{ 
                        color: 'warning.main', 
                        verticalAlign: 'middle', 
                        ml: 0.5,
                        fontSize: '1rem'
                      }} 
                    />
                  )}
                </Tooltip>
              )}
              {/* 4th of July Count */}
              {numberFourthAttendees > 0 && (
                <Tooltip title={`${numberFourthAttendees} guest${numberFourthAttendees > 1 ? 's' : ''} attending July 4th`}>
                  <Chip
                    size="small"
                    icon={<FlareIcon />}
                    label={numberFourthAttendees}
                    sx={{
                      ml: 1,
                      height: '22px',
                      //background: 'linear-gradient(135deg, #e01f3d 0%, #e01f3d 30%, #ffffff 30%, #ffffff 70%, #004dbc 70%, #004dbc 100%)',
                      color: ' #ffffff',
                      border: '1px solid #004dbc',
                      //textShadow: '0px 1px 2px rgba(0,0,0,0.75)',
                      '& .MuiChip-label': {
                        px: 0.5,
                        fontWeight: 'bold',
                        //backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: '3px',
                        mx: 0.25
                      },
                      '& .MuiChip-icon': {
                        color: '#ffcc00',
                        ml: 0.5,
                        mr: '-4px',
                        //filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.75))'
                      }
                    }}
                  />
                </Tooltip>
              )}
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
            onClick={onToggleExpanded}
            aria-expanded={expanded}
            aria-label="show more"
            data-testid="expand-button"
            sx={{
              backgroundColor: expanded ? rgba(theme.palette.primary.main, 0.1) : 'transparent',
	      zIndex: 10, // Ensure button is clickable
              position: 'relative',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
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
                <span>
                  <GuestStatusItem 
                    invitationCode={family.invitationCode}
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
                      invitationCode={family.invitationCode}
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
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Mailing Address
                    {family.mailingAddress?.uspsVerified && (
                      <Tooltip title="Address verified">
                        <VerifiedIcon 
                          fontSize="small" 
                          sx={{ 
                            color: 'success.main', 
                            verticalAlign: 'middle', 
                            ml: 0.5,
                            fontSize: '0.8rem'
                          }} 
                        />
                      </Tooltip>
                    )}
                  </Typography>
                </Box>
                {family.mailingAddress ? (
                  <Typography variant="body2">
                    {family.mailingAddress.streetAddress}<br />
                    {family.mailingAddress.secondaryAddress !== null 
                      ? family.mailingAddress.secondaryAddress 
                      : ''}
                    {family.mailingAddress.secondaryAddress !== undefined && <br/>}
                    {family.mailingAddress.city}, {family.mailingAddress.state} {family.mailingAddress.postalCode}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="error">
                    No address provided
                  </Typography>
                )}
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
                  {lastGuestActivity.lastActivity 
                    ? `${new Date(lastGuestActivity.lastActivity).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}${lastGuestActivity.firstName ? ` by ${lastGuestActivity.firstName}` : ''}`
                    : (family.familyUnitLastLogin 
                        ? `${new Date(family.familyUnitLastLogin).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })} (Login only)`
                        : 'Never logged in')}
                </Typography>
              </Box>
            </Paper>

            {/* Family Comments/Notes */}
            {family.invitationResponseNotes && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2,
                  pb: 3, // Increase bottom padding specifically
                  backgroundColor: rgba(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(20px)',
                  borderRadius: 1,
                  display: 'flex',
                  gap: 1,
                  borderLeft: '4px solid',
                  borderColor: 'info.main'
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Comments
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    paddingBottom: 2 // Add padding at the bottom to prevent text from being cut off
                  }}>
                    {family.invitationResponseNotes.trim() === '' ? '(none)' : family.invitationResponseNotes}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default React.memo(AdminFamilyCard);