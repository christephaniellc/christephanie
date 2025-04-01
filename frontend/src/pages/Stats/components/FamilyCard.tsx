import { 
  Card, CardHeader, CardContent, Divider, 
  Box, Typography, Chip, Paper, Stack, Grid, useTheme,
  IconButton, Collapse, AvatarGroup, Tooltip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { useState } from 'react';
import { rgba } from 'polished';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';

import { FamilyUnitDto, FamilyUnitViewModel } from '@/types/api';
import { getFamilyStatusColor, getLatestActivityAndGuest } from './AdminHelpers';
import GuestStatusItem from './GuestStatusItem';
import TierSquare from './TierSquare';
import AddressEditor from './AddressEditor';

interface FamilyCardProps {
  family: FamilyUnitDto;
  onGuestClick: (event: React.MouseEvent<HTMLElement>, guestId: string) => void;
  onFamilyUpdate?: (familyId: string, updatedData: Partial<FamilyUnitDto>) => void;
}

const FamilyCard = ({ family, onGuestClick, onFamilyUpdate = undefined }: FamilyCardProps) => {
  const theme = useTheme();
  const statusColor = getFamilyStatusColor(family);
  const [expanded, setExpanded] = useState(false);
  const lastGuestActivity = getLatestActivityAndGuest(family);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  
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
        maxHeight: expanded ? '600px' : '180px', // Increased expanded height to accommodate comments
      }}
      data-testid="family-card"
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TierSquare tier={family.tier} />
            <Typography variant="h6" component="div">
              {family.unitName}
              {(!family.mailingAddress || !family.mailingAddress.uspsVerified) && (
                <Tooltip title={!family.mailingAddress ? "No address provided" : "Address not verified"}>
                  <WarningAmberIcon 
                    fontSize="small" 
                    sx={{ 
                      color: 'warning.main', 
                      verticalAlign: 'middle', 
                      ml: 0.5,
                      fontSize: '1rem'
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
                      editable={!!onFamilyUpdate}
                      onGuestUpdated={() => {
                        if (onFamilyUpdate) {
                          onFamilyUpdate(family.invitationCode || '', {});
                        }
                      }}
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
                  
                  {/* Add address edit button if onFamilyUpdate is provided */}
                  {onFamilyUpdate && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setEditAddressOpen(true)}
                    >
                      Edit Address
                    </Button>
                  )}
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
            {/* Shows the most recent family activity and which guest performed it */}
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
                    ? `${new Date(family.familyUnitLastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}${lastGuestActivity.firstName ? ` by ${lastGuestActivity.firstName}` : ''}`
                    : 'Never logged in'}
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
                    //fontStyle: 'italic',
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

      {/* Edit Address Dialog */}
      {onFamilyUpdate && (
        <Dialog 
          open={editAddressOpen} 
          onClose={() => setEditAddressOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Family Address</DialogTitle>
          <DialogContent>
            <AddressEditor 
              address={family.mailingAddress}
              invitationCode={family.invitationCode}
              onUpdate={(updatedData) => onFamilyUpdate(family.invitationCode, updatedData)}
              onClose={() => setEditAddressOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default FamilyCard;