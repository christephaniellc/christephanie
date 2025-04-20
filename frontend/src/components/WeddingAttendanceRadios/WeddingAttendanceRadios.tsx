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
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { useMemo, useState, useEffect } from 'react';

import { AgeGroupEnum, InvitationResponseEnum, RsvpEnum } from '@/types/api';

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
    backgroundColor: `rgba(255, 255, 255, .98)`,
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

interface WeddingAttendanceRadiosProps {
  guestId: string;
  initialModalOpen?: boolean;
  onModalClose?: () => void;
}

const WeddingAttendanceRadios = ({ 
  guestId, 
  initialModalOpen = false, 
  onModalClose 
}: WeddingAttendanceRadiosProps) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(initialModalOpen);
  const { boxShadow } = useBoxShadow();

  const guest = useRecoilValue(guestSelector(guestId));
  const family = useRecoilValue(familyState);
  const [, familyActions] = useFamily();
  const interested = guest?.rsvp?.invitationResponse || InvitationResponseEnum.Pending;
  const { user } = useAuth0();
  const isMe = guest?.auth0Id === user?.sub;

  // For invitation response slider
  const [invitationResponse, setInvitationResponse] = useState<InvitationResponseEnum>(
    guest?.rsvp?.invitationResponse || InvitationResponseEnum.Pending,
  );

  useEffect(() => {
    if (guest?.rsvp?.invitationResponse) {
      setInvitationResponse(guest.rsvp.invitationResponse);
    }
  }, [guest]);

  // Set modal open state when prop changes
  useEffect(() => {
    setModalOpen(initialModalOpen);
  }, [initialModalOpen]);

  const invitationResponseIndex = useMemo(() => {
    switch (invitationResponse) {
      case InvitationResponseEnum.Interested:
        return 2;
      case InvitationResponseEnum.Declined:
        return 0;
      case InvitationResponseEnum.Pending:
      default:
        return 1;
    }
  }, [invitationResponse]);

  // Translate slider value to invitation response status
  const getInvitationResponseFromIndex = (index: number): InvitationResponseEnum => {
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
  const invitationResponseMarks = [
    { label: 'Declined.', value: 0 },
    { label: 'Undecided?', value: 1 },
    { label: 'Interested!', value: 2 },
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

  // For testing response formatting in different scenarios - remove in production
  const testResponseScenarios = () => {
    // This function won't execute in production, it's just to verify sentence formatting
    const scenarios = [];

    // Test scenario 1: You're attending one event
    const scenario1 = createMockResponse({
      isMe: true,
      foodPreference: 'Omnivore',
      ageGroup: AgeGroupEnum.Adult,
      mailingAddress: { uspsVerified: true },
      allergies: ['peanuts'],
      interested: InvitationResponseEnum.Interested,
      weddingRsvp: RsvpEnum.Attending,
      sleepPreference: 'Camping'
    });
    scenarios.push({ name: "You attending one event", result: scenario1 });

    // Test scenario 2: They're attending multiple events
    const scenario2 = createMockResponse({
      isMe: false,
      foodPreference: 'Vegan',
      ageGroup: AgeGroupEnum.Under21,
      mailingAddress: { uspsVerified: true },
      allergies: ['peanuts', 'gluten', 'dairy'],
      interested: InvitationResponseEnum.Interested,
      weddingRsvp: RsvpEnum.Attending,
      rehearsalRsvp: RsvpEnum.Attending,
      sleepPreference: 'Hotel'
    });
    scenarios.push({ name: "They attending multiple events", result: scenario2 });

    // Test scenario 3: You're skipping some events, attending others
    const scenario3 = createMockResponse({
      isMe: true,
      foodPreference: 'Vegetarian',
      ageGroup: AgeGroupEnum.Adult,
      mailingAddress: { uspsVerified: false },
      allergies: [],
      interested: InvitationResponseEnum.Interested,
      weddingRsvp: RsvpEnum.Attending,
      rehearsalRsvp: RsvpEnum.Declined,
      sleepPreference: 'Other'
    });
    scenarios.push({ name: "You mixed attendance", result: scenario3 });

    // Test scenario 4: They're pending
    const scenario4 = createMockResponse({
      isMe: false,
      foodPreference: 'Unknown',
      ageGroup: AgeGroupEnum.Baby,
      mailingAddress: null,
      allergies: [],
      interested: InvitationResponseEnum.Pending,
      sleepPreference: null
    });
    scenarios.push({ name: "They pending", result: scenario4 });

    //console.log("Response Formatting Test Scenarios:", scenarios);
    return scenarios;
  };

  // Helper function for test scenarios
  const createMockResponse = (args: any) => {
    const mockGuest = {
      preferences: {
        foodPreference: args.foodPreference,
        foodAllergies: args.allergies,
        sleepPreference: args.sleepPreference
      },
      ageGroup: args.ageGroup,
      rsvp: {
        invitationResponse: args.interested,
        wedding: args.weddingRsvp,
        rehearsalDinner: args.rehearsalRsvp,
        fourthOfJuly: args.fourthRsvp
      }
    };

    const mockFamily = {
      mailingAddress: args.mailingAddress,
      invitationResponseNotes: args.notes
    };

    // Logic similar to the real response function
    let response = '';

    // Food preference
    if (mockGuest.preferences.foodPreference) {
      const foodText = {
        'Unknown': 'A carnivorous',
        'Vegan': 'A vegan',
        'Vegetarian': 'A mostly-plant-eating',
        'Omnivore': 'An equal-opportunity-eating',
        'BYOB': 'A tiny'
      }[mockGuest.preferences.foodPreference] || '';

      response += foodText;
    }

    // Age group
    if (mockGuest.ageGroup) {
      const ageText = {
        [AgeGroupEnum.Adult]: 'adult',
        [AgeGroupEnum.Under21]: 'under 21 adult',
        [AgeGroupEnum.Under13]: 'dependent',
        [AgeGroupEnum.Baby]: 'baby'
      }[mockGuest.ageGroup] || '';

      response = `${response} ${ageText}`;
    }

    // Mailing address
    if (!mockFamily.mailingAddress) {
      response += ` who hasn't shared their address yet.`;
    } else {
      response += `, whose address we have`;
      if (mockFamily.mailingAddress.uspsVerified) {
        response += ` verified.`;
      }
    }

    // Allergies
    if (args.allergies && args.allergies.length > 0) {
      const formattedAllergies = args.allergies.length === 1
        ? args.allergies[0]
        : args.allergies.length === 2
          ? `${args.allergies[0]} or ${args.allergies[1]}`
          : args.allergies.slice(0, -1).join(', ') + `, or ${args.allergies[args.allergies.length - 1]}`;

      response += ` ${args.isMe ? 'You' : 'They'} will literally or figuratively die if ${
        args.isMe ? 'you' : 'they'
      } consume ${formattedAllergies}.`;
    }

    // Early returns for declined/pending
    if (args.interested === InvitationResponseEnum.Declined) {
      return (response += ` ${args.isMe ? "You've" : "They've"} declined the invitation.`);
    }

    if (args.interested === InvitationResponseEnum.Pending) {
      return (response += ` ... still thinking about it for some reason.`);
    }

    // Format lists
    const formatList = (items) => {
      if (items.length === 0) return "";
      if (items.length === 1) return items[0];
      if (items.length === 2) return `${items[0]} and ${items[1]}`;

      const allButLast = items.slice(0, -1).join(', ');
      return `${allButLast}, and ${items[items.length - 1]}`;
    };

    // Only process events if the guest is interested
    if (args.interested === InvitationResponseEnum.Interested) {
      const attendingEvents = [];
      const skippingEvents = [];

      if (args.weddingRsvp) {
        if (args.weddingRsvp === RsvpEnum.Attending) {
          attendingEvents.push(`the wedding`);
        } else if (args.weddingRsvp === RsvpEnum.Declined) {
          skippingEvents.push(`the wedding`);
        }
      }

      if (args.rehearsalRsvp) {
        if (args.rehearsalRsvp === RsvpEnum.Attending) {
          attendingEvents.push(`the rehearsal dinner`);
        } else if (args.rehearsalRsvp === RsvpEnum.Declined) {
          skippingEvents.push(`the rehearsal dinner`);
        }
      }

      // Add attending events if any
      if (attendingEvents.length > 0) {
        response += ` ${args.isMe ? "You're" : "They're"} attending ${formatList(attendingEvents)}.`;
      }

      // Add skipping events if any
      if (skippingEvents.length > 0) {
        response += ` ${args.isMe ? "You're" : "They're"} skipping ${formatList(skippingEvents)}.`;
      }
    }

    // Event handling is done within the interested conditional block above

    // Sleep preference
    if (mockGuest.preferences.sleepPreference) {
      let sleepText = '';
      switch (mockGuest.preferences.sleepPreference) {
        case 'Hotel':
          sleepText = `${args.isMe ? "You're" : "They're"} staying at a hotel.`;
          break;
        case 'Camping':
          sleepText = `${args.isMe ? "You're" : "They're"} camping with us!`;
          break;
        case 'Other':
          sleepText = `${args.isMe ? "You have your" : "They have their"} sleep situation figured out already.`;
          break;
      }

      if (sleepText) {
        response += ` ${sleepText}`;
      }
    }

    // Notes
    if (mockFamily.invitationResponseNotes) {
      response += ` ${args.isMe ? "You" : "Someone in your party"} left us some feedback.`;
    }

    return response;
  };

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
            return 'under 21 human';

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

    const hasAllergies =
      guest.preferences.foodAllergies !== null &&
      guest.preferences.foodAllergies !== undefined &&
      guest.preferences.foodAllergies.length > 0 &&
      guest.preferences.foodAllergies.join('') !== '' &&
      guest.preferences.foodAllergies.join('') !== 'none';

    if (hasAllergies) {
      // Format allergies nicely
      const formattedAllergies = guest.preferences.foodAllergies.length === 1
        ? guest.preferences.foodAllergies[0]
        : guest.preferences.foodAllergies.length === 2
          ? `${guest.preferences.foodAllergies[0]} or ${guest.preferences.foodAllergies[1]}`
          : guest.preferences.foodAllergies.slice(0, -1).join(', ') + `, or ${guest.preferences.foodAllergies[guest.preferences.foodAllergies.length - 1]}`;

      overallResponse += ` ${isMe ? 'You' : 'They'} will literally or figuratively die if ${
        isMe ? 'you' : 'they'
      } consume ${formattedAllergies}.`;
    }

    if (interested === 'Declined') return (overallResponse += ` ${isMe ? "You've" : "They've"} declined the invitation.`);

    if (interested === 'Pending') return (overallResponse += ` ${interestedOption}`);

    // Add event responses differently based on invitation response status

    // Function to properly format a list with commas and "and"
    const formatList = (items: string[]) => {
      if (items.length === 0) return "";
      if (items.length === 1) return items[0];
      if (items.length === 2) return `${items[0]} and ${items[1]}`;

      const allButLast = items.slice(0, -1).join(', ');
      return `${allButLast}, and ${items[items.length - 1]}`;
    };

    // Handle different invitation responses with different narratives
    if (interested === InvitationResponseEnum.Interested) {
      const attendingEvents = [];
      const skippingEvents = [];

      // Wedding RSVP
      if (guest.rsvp?.wedding) {
        if (guest.rsvp.wedding === RsvpEnum.Attending) {
          attendingEvents.push(`the wedding`);
        } else if (guest.rsvp.wedding === RsvpEnum.Declined) {
          skippingEvents.push(`the wedding`);
        }
      }

      // Rehearsal Dinner RSVP
      if (guest.rsvp?.rehearsalDinner) {
        if (guest.rsvp.rehearsalDinner === RsvpEnum.Attending) {
          attendingEvents.push(`the rehearsal dinner`);
        } else if (guest.rsvp.rehearsalDinner === RsvpEnum.Declined) {
          skippingEvents.push(`the rehearsal dinner`);
        }
      }

      // Add attending events if any
      if (attendingEvents.length > 0) {
        overallResponse += ` ${isMe ? "You're" : "They're"} attending ${formatList(attendingEvents)}.`;
      }

      // Add skipping events if any
      if (skippingEvents.length > 0) {
        overallResponse += ` ${isMe ? "You're" : "They're"} skipping ${formatList(skippingEvents)}.`;
      }
    }

    if (guest.preferences.sleepPreference) {
      const sleepPreferenceVerb = () => {
        switch (guest.preferences.sleepPreference) {
          case 'Unknown':
            return ``;
          case 'Hotel':
            return `${isMe ? "You're" : "They're"} staying at a hotel.`;
          case 'Camping':
            return `${isMe ? "You're" : "They're"} camping with us!`;
          case 'Other':
            return `${isMe ? "You have your" : "They have their"} sleep situation figured out already.`;
          default:
            return '';
        }
      };

      const sleepText = sleepPreferenceVerb();
      if (sleepText) {
        overallResponse += ` ${sleepText}`;
      }
    }

    if (family.invitationResponseNotes) {
      overallResponse += ` ${isMe ? "You" : "Someone in your party"} left us some feedback.`;
    }

    return overallResponse;
  }, [interested, guest, family, isMe, interestedOption]);

  const queryKey = ['updateFamilyUnit'];
  const queryClient = useQueryClient();
  const familyQuery = queryClient.getQueryState(queryKey);
  const declined = useMemo(() => interested === 'Declined', [interested]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Call the parent's onModalClose callback if provided
    if (onModalClose) {
      onModalClose();
    }
  };

  // Content box - no longer clickable
  const contentBox = (
    <Box
      display={'flex'}
      alignItems="center"
      width="100%"
      sx={{
        fontSize: { xs: modalOpen ? '1rem' : '0.65rem', md: modalOpen ? '1.2rem' : '0.6rem' },
        overflowY: 'visible',
        wordBreak: 'break-word',
        lineHeight: { xs: modalOpen ? 1.5 : 1.3, md: 'inherit' },
        height: 'auto',
        color: 'white',
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
      {/* Just render the content box without the click handler */}
      <Box>{contentBox}</Box>

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

          <Box
            sx={{
              p: 2,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              mb: 2,
            }}
          >
            {contentBox}
          </Box>

          {/* Invitation Response Slider */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Box
              display="flex"
              flexWrap="wrap"
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
                color="secondary"
                sx={{ textAlign: 'center', mb: 2 }}
              >
                {isMe ? 'Your' : `${guest?.firstName}'s`} Invitation Response
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
                    value={invitationResponseIndex}
                    marks={invitationResponseMarks}
                    slots={{
                      thumb: AttendanceThumbComponent,
                    }}
                    onChange={(_, value) => {
                      setInvitationResponse(getInvitationResponseFromIndex(value as number));
                    }}
                    onChangeCommitted={(_event, value) => {
                      const newStatus = getInvitationResponseFromIndex(value as number);
                      familyActions.patchFamilyGuestMutation.mutate({
                        updatedGuest: {
                          guestId,
                          invitationResponse: newStatus,
                        },
                      });
                    }}
                  />
                </Box>
              </Button>

              <Typography
                variant="caption"
                color="secondary"
                sx={{
                  width: '100%',
                  textAlign: 'center',
                  mt: 2,
                }}
              >
                {invitationResponse === InvitationResponseEnum.Interested && family.mailingAddress &&
                  (family.mailingAddress.uspsVerified
                    ? 'Huzzah! '
                    : 'Please verify your address so we can mail your RSVP!')}
                {invitationResponse === InvitationResponseEnum.Interested && !family.mailingAddress &&
                  'Please provide your address so we can mail your RSVP!'}
                {invitationResponse === InvitationResponseEnum.Declined && 'We understand, but we\'ll miss you!'}
                {invitationResponse === InvitationResponseEnum.Pending &&
                  'Take your time deciding - but not too much time!'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              color={
                invitationResponse === InvitationResponseEnum.Interested
                  ? 'secondary'
                  : invitationResponse === InvitationResponseEnum.Declined
                    ? 'error'
                    : 'info.main'
              }
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              {invitationResponse === InvitationResponseEnum.Interested &&
                (family.mailingAddress?.uspsVerified
                  ? 'Your RSVP will be mailed soon!'
                  : 'Please give us your address in the next step or so, depending on where we put it last, so we can mail your RSVP!')}
              {invitationResponse === InvitationResponseEnum.Declined && 'Wow.'}
              {invitationResponse === InvitationResponseEnum.Pending &&
                'Still thinking about it? Really?!'}
            </Typography>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default WeddingAttendanceRadios;
