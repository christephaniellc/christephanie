import * as React from 'react';

import { Box, Typography } from '@mui/material';

import { useMemo } from 'react';

import { AgeGroupEnum, InvitationResponseEnum } from '@/types/api';

import StickFigureIcon from '@/components/StickFigureIcon';

import { useQueryClient } from '@tanstack/react-query';

import { useRecoilValue } from 'recoil';

import { useAuth0 } from '@auth0/auth0-react';

import { familyState, guestSelector } from '@/store/family';

const WeddingAttendanceRadios = ({ guestId }: { guestId: string }) => {
  const guest = useRecoilValue(guestSelector(guestId));

  const family = useRecoilValue(familyState);

  const interested = guest?.rsvp?.invitationResponse || InvitationResponseEnum.Pending;

  const { user } = useAuth0();

  const isMe = guest?.auth0Id === user?.sub;

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

    let setAllergyResponse =
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

    if (!!family.invitationResponseNotes) {
      overallResponse += `You left us some feedback.`;
    }

    return overallResponse;
  }, [interested, guest, family]);

  const queryKey = ['updateFamilyUnit'];

  const queryClient = useQueryClient();

  const familyQuery = queryClient.getQueryState(queryKey);

  const declined = useMemo(() => interested === 'Declined', [interested]);

  return (
    <Box
      display={'flex'}
      alignItems="center"
      width="100%"
      sx={{
        fontSize: {xs: '0.65rem', md: '0.6rem'},
        overflowY: 'visible',
        wordBreak: 'break-word',
        lineHeight: {xs: 1.3, md: 'inherit'}, 
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
};

export default WeddingAttendanceRadios;
