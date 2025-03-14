import * as React from 'react';

import { 
  Box, 
  Typography, 
  Modal, 
  IconButton, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Slider,
  SliderThumb,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { useMemo, useState, useEffect } from 'react';

import { AgeGroupEnum, InvitationResponseEnum } from '@/types/api';

import StickFigureIcon from '@/components/StickFigureIcon';

import { useQueryClient } from '@tanstack/react-query';

import { useRecoilValue } from 'recoil';

import { useAuth0 } from '@auth0/auth0-react';

import { familyState, guestSelector, useFamily } from '@/store/family';

import { styled } from '@mui/material/styles';
import { useBoxShadow } from '@/hooks/useBoxShadow';

// Component for attendance status slider thumb
function AttendanceThumbComponent(props: React.HTMLAttributes<unknown>) {
  const { children, ...other } = props;
  return <SliderThumb {...other}>{children}</SliderThumb>;
}

// Styled slider component
const AttendanceSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-track': {
    background: `linear-gradient(to bottom, ${theme.palette.secondary.dark} 0%, transparent 80%, black 100%)`,
    width: '20px',
    transform: 'translateX(-50%)',
    height: '100% !important',
    border: `1px solid ${theme.palette.secondary.main}`,
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'transparent',
  },
  '& .MuiSlider-thumb': {
    height: 27,
    width: 27,
    backgroundColor: `rgba(255, 255, 255,.98)`,
    backdropFilter: 'blur(80)',
    border: `1px solid ${theme.palette.secondary.main}`,
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
    },
    '&:disabled': {
      backgroundColor: 'rgba(0, 0, 0, 0.26)',
    },
  },
  '& .MuiSlider-mark': {
    display: 'none',
  },
  '& .MuiSlider-markLabel': {
    color: theme.palette.grey.A700,
    fontWeight: 'bold',
    '&.MuiSlider-markLabelActive': {
      color: theme.palette.secondary.main,
    },
  },
}));

const WeddingAttendanceRadios = ({ guestId }: { guestId: string }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [modalOpen, setModalOpen] = useState(false);
  const { boxShadow } = useBoxShadow();
  
  const guest = useRecoilValue(guestSelector(guestId));
  const family = useRecoilValue(familyState);
  const [, familyActions] = useFamily();
  const interested = guest?.rsvp?.invitationResponse || InvitationResponseEnum.Pending;
  const { user } = useAuth0();
  const isMe = guest?.auth0Id === user?.sub;
  
  // For attendance status slider
  const [attendanceStatus, setAttendanceStatus] = useState<InvitationResponseEnum>(interested);
  
  useEffect(() => {
    if (guest?.rsvp?.invitationResponse) {
      setAttendanceStatus(guest.rsvp.invitationResponse);
    }
  }, [guest]);
  
  const attendanceStatusIndex = useMemo(() => {
    switch (attendanceStatus) {
      case InvitationResponseEnum.Interested:
        return 2;
      case InvitationResponseEnum.Declined:
        return 0;
      case InvitationResponseEnum.Pending:
      default:
        return 1;
    }
  }, [attendanceStatus]);
  
  // Translate slider value to attendance status
  const getAttendanceStatusFromIndex = (index: number): InvitationResponseEnum => {
    switch (index) {
      case 2:
        return InvitationResponseEnum.Interested;
      case 0:
        return InvitationResponseEnum.Declined;
      case 1:
      default:
        return InvitationResponseEnum.Pending;
    }
  };
  
  // Marks for the slider
  const attendanceMarks = [
    { label: 'No Thanks', value: 0 },
    { label: 'Undecided', value: 1 },
    { label: 'Attending', value: 2 },
  ];

  const interestedOptions = [
    "... uh ¯\\_(ツ)_/¯ Who knows! Maybe they'll make it!",
    "They're figuring things out.  only time will tell.",
    "It's fine, we can wait.",
    "I'm sure we'll all find out one day.",
    'not really a planner',
    'still thinking about it for some reason.',
  ];

  const interestedOption = useMemo(
    () => interestedOptions[Math.floor(Math.random() * interestedOptions.length)],
    [interested],
  );

  const response = useMemo(() => {
    let overallResponse = ``;

    if (guest.preferences.foodPreference) {
      const foodPreferenceVerb = () => {
        switch (guest.preferences.foodPreference) {
          case 'Unknown':
            return `A carnivorous `;
          case 'Vegan':
            return 'A vegan ';
          case 'Vegetarian':
            return 'A mostly-plant-eating ';
          case 'Omnivore':
            return 'An equal-opportunity-eating ';
          case 'BYOB':
            return 'A tiny ';
          default:
            return guest.preferences.foodPreference === 'Vegan';
        }
      };

      overallResponse += `${foodPreferenceVerb()}`;
    }

    if (guest.ageGroup) {
      const ageGroupVerb = () => {
        switch (guest.ageGroup) {
          case AgeGroupEnum.Adult:
            return 'adult';
          case AgeGroupEnum.Under21:
            return 'under 21 adult';
          case AgeGroupEnum.Under13:
            return 'dependent';
          case AgeGroupEnum.Baby:
            return 'baby';
          default:
            return guest.ageGroup === 'Adult';
        }
      };

      overallResponse = `${overallResponse} ${ageGroupVerb()}`;
    }

    if (!family.mailingAddress) {
      overallResponse += ` who hasn't shared their address yet. `;
    }

    if (family.mailingAddress) {
      overallResponse += `, whose address we have `;

      if (family.mailingAddress.uspsVerified) {
        overallResponse += `verified.`;
      }
    }

    const setAllergyResponse =
      guest.preferences.foodAllergies !== null &&
      guest.preferences.foodAllergies !== undefined &&
      guest.preferences.foodAllergies.length > 0 &&
      guest.preferences.foodAllergies.join('') !== '' &&
      guest.preferences.foodAllergies.join('') !== 'none';

    if (setAllergyResponse) {
      overallResponse += ` ${isMe ? 'You' : 'They'} will literally or figuratively die if ${
        isMe ? 'you' : 'they'
      } consume ${guest.preferences.foodAllergies.join(' or ')}.`;
    }

    if (interested === 'Declined') return (overallResponse += ` That's their problem now.`);

    if (interested === 'Pending') return (overallResponse += ` ${interestedOption}`);

    if (guest.preferences.sleepPreference) {
      const sleepPreferenceVerb = () => {
        switch (guest.preferences.sleepPreference) {
          case 'Unknown':
            return ``;
          case 'Hotel':
            return `${isMe ? "You're" : "They're"} staying at a hotel. `;
          case 'Camping':
            return `${isMe ? "You're" : "They're"} camping w/ us! `;
          case 'Other':
            return 'have their sleep situation figured out already. ';
          default:
            return '';
        }
      };

      overallResponse += ` ${sleepPreferenceVerb()}`;
    }

    if (family.invitationResponseNotes) {
      overallResponse += `You left us some feedback.`;
    }

    return overallResponse;
  }, [interested, guest, family, isMe]);

  const queryKey = ['updateFamilyUnit'];
  const queryClient = useQueryClient();
  const familyQuery = queryClient.getQueryState(queryKey);
  const declined = useMemo(() => interested === 'Declined', [interested]);

  const handleOpenModal = () => {
    if (isMobile) {
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const contentBox = (
    <Box
      display={'flex'}
      alignItems="center"
      width="100%"
      sx={{
        fontSize: {xs: modalOpen ? '1rem' : '0.65rem', md: '0.6rem'},
        overflowY: 'visible',
        wordBreak: 'break-word',
        lineHeight: {xs: modalOpen ? 1.5 : 1.3, md: 'inherit'}, 
        height: 'auto',
        color: 'white',
        cursor: isMobile ? 'pointer' : 'default',
      }}
    >
      {declined && (
        <Typography mr={2} component="div">
          <StickFigureIcon
            fontSize="small"
            ageGroup={guest?.ageGroup}
            loading={familyQuery?.fetchStatus === 'fetching'}
          />
        </Typography>
      )}

      {response}
    </Box>
  );

  return (
    <>
      <Box onClick={handleOpenModal}>
        {contentBox}
      </Box>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="guest-details-modal"
        aria-describedby="guest-attendance-details"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            pt: 6,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9))',
            backdropFilter: 'blur(10px)',
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" component="h2" color="primary" gutterBottom>
              {isMe ? 'Your' : `${guest?.firstName}'s`} Details
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: 2,
            mb: 2 
          }}>
            {contentBox}
          </Box>
          
          {/* Attendance Status Slider */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Box
              display="flex"
              flexWrap='wrap'
              sx={{
                p: 2,
                height: '100%',
                overflow: 'hidden',
                border: `2px solid rgba(255,255,255,0.2)`,
                alignContent: 'space-between',
                backdropFilter: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                width: { xs: '100%', sm: 250 },
                mx: 'auto',
                maxWidth: '300px',
                borderRadius: 2,
              }}
            >
              <Typography 
                variant="body1" 
                width={'100%'} 
                color='secondary' 
                sx={{ textAlign: 'center', mb: 2 }}
              >
                {isMe ? 'Your' : `${guest?.firstName}'s`} RSVP Status
              </Typography>
              
              <Button
                component={Paper}
                elevation={10}
                sx={{
                  my: 2,
                  alignItems: 'center',
                  pt: 5,
                  pb: 3,
                  pr: 6,
                  pl: 4,
                  mx: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  width: { xs: '180px', sm: 180 },
                  minWidth: { xs: '180px', sm: 180 }, 
                  maxWidth: { xs: '180px', sm: 180 },
                  boxShadow: boxShadow,
                  backgroundColor: 'transparent',
                  flexGrow: 2,
                  height: 135,
                }}
              >
                <Box
                  sx={{
                    fontSize: 'medium',
                    color: theme.palette.text.primary,
                    position: 'relative',
                    marginBottom: theme.spacing(2),
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    paddingRight: theme.spacing(12),
                  }}
                >
                  <AttendanceSlider
                    sx={{ pointerEvents: 'auto' }}
                    orientation="vertical"
                    defaultValue={1}
                    max={2}
                    min={0}
                    value={attendanceStatusIndex}
                    marks={attendanceMarks}
                    slots={{
                      thumb: AttendanceThumbComponent,
                    }}
                    onChange={(_, value) => {
                      setAttendanceStatus(getAttendanceStatusFromIndex(value as number));
                    }}
                    onChangeCommitted={(_event, value) => {
                      const newStatus = getAttendanceStatusFromIndex(value as number);
                      familyActions.updateFamilyGuestInterest(guestId, newStatus);
                    }}
                  />
                </Box>
              </Button>
              
              <Typography 
                variant="caption" 
                color='secondary'
                sx={{ 
                  width: '100%',
                  textAlign: 'center',
                  mt: 2
                }}
              >
                {attendanceStatus === InvitationResponseEnum.Interested && "Looking forward to seeing you!"}
                {attendanceStatus === InvitationResponseEnum.Declined && "Sorry you can't make it."}
                {attendanceStatus === InvitationResponseEnum.Pending && "Still thinking about it?"}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 4 }}>
            <Typography 
              variant="h6" 
              color={
                attendanceStatus === InvitationResponseEnum.Interested ? "secondary" : 
                attendanceStatus === InvitationResponseEnum.Declined ? "error" : 
                "info.main"
              } 
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              {attendanceStatus === InvitationResponseEnum.Interested && `Looking forward to seeing ${isMe ? 'you' : 'them'} at the wedding!`}
              {attendanceStatus === InvitationResponseEnum.Declined && `We&apos;ll miss ${isMe ? 'you' : 'them'} at the wedding.`}
              {attendanceStatus === InvitationResponseEnum.Pending && `Waiting for ${isMe ? 'your' : 'their'} decision.`}
            </Typography>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default WeddingAttendanceRadios;
