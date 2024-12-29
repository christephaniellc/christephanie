import { useEffect, useMemo, useState } from 'react';
import { useChristephanieTheme } from '../../ThemeContext';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { FamilyUnitDto, GuestDto } from '../../../../../types/types';
import { useCommonContext } from '../../../../CommonContext';

export const useRSVP = () => {
  const { user } = useAuth0();
  const { api } = useCommonContext();
  const { mixedBackgroundSx, mode } = useChristephanieTheme();
  const [invitationCode, setInvitationCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');

  const [familyUnit, setFamilyUnit] = useState<FamilyUnitDto | null>(null);
  const [matchingUsers, setMatchingUsers] = useState<GuestDto[]>([] as GuestDto[]);
  const [rsvpCodeValidated, setRsvpCodeValidated] = useState(false);
  const allUsersPending = useMemo(() => matchingUsers.every((user) => user.rsvp?.invitationResponse === 'Pending'), [matchingUsers]);

  const getFamilyQuery: UseMutationResult<FamilyUnitDto, unknown, { inviteCode: string, firstName: string }, unknown>
    = useMutation({
    mutationFn: ({inviteCode, firstName}: { inviteCode: string, firstName: string }) => api.getFamily(inviteCode, firstName),
    onSettled: (data) => {
      if (data) {
        setFamilyUnit(data);
        setMatchingUsers(data.guests || []);
      }
    },

  });

  useEffect(() => {
    if (getFamilyQuery.data && getFamilyQuery.data.guests) {
      setMatchingUsers(getFamilyQuery.data.guests);
      setFamilyUnit(getFamilyQuery.data);
    }
  }, [getFamilyQuery.data]);


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, field: 'rsvpCode' | 'firstName') => {
    const inputValue = event.target.value.toUpperCase();
    if (field === 'rsvpCode') setInvitationCode(inputValue);
    if (field === 'firstName') setFirstName(inputValue);
    if (inputValue.length < 2 || inputValue.length > 15) {
      setError('Wrong.');
    } else {
      setError('');
    }
  };

  const handleClick = () => {
    if (invitationCode.length < 5 || firstName.length < 2) {
      setError('RSVP codes are 5 characters long, you hacker');
      return;
    }
    setRsvpCodeValidated(true);
  };

  const setUserIsAttending = (guest: GuestDto, guestInterested: 'Pending' | 'Interested' | 'Declined') => {
    if (matchingUsers) {
      setMatchingUsers(() => {
        if (!matchingUsers) {
          return [] as GuestDto[];
        }
        return matchingUsers.map((user) => {
          if (user.guestId === guest.guestId) {
            return {
              ...user,
              rsvp: {
                ...user.rsvp,
                invitation: guestInterested,
              },
            };
          }
          return user;
        });
      });
    }
    ;
  };

  const setFamilyUnitAddress = (addressPortion: 'street' | 'apt' | 'lastLine', value: string) => {
    const constructedAddress = value;

    if (familyUnit) {
      setFamilyUnit(() => {
        return {
          ...familyUnit,
          mailingAddress: constructedAddress,
        };
      });
    }
  };

  const addressValidated = useMemo(() => !!familyUnit?.mailingAddress, [familyUnit]);

  const actionNeededMessage: string = useMemo(() => {
    const actionsNeeded = {
      createAnAccount: 'Create an account',
      respondToInvitation: 'Let us know who\'s interested in attending!',
      submitAnAddress: 'Submit your address',
      startRsvp: 'Submit your RSVP',
      completeRsvp: 'Complete your RSVP',
      campingRsvp: 'Reserve your camping spot',
      noActionsNeeded: 'You\'re all set!  See you on the big day!',
      noOneIsComing: 'We\'re sorry you can\'t make it.  We\'ll miss you!',
    };
    const allUsersPending = matchingUsers.every((user) => user.rsvp?.invitationResponse === 'Pending');
    const allUsersDeclined = matchingUsers.every((user) => user.rsvp?.invitationResponse === 'Declined');

    if (!user) return actionsNeeded.createAnAccount as string;
    if (allUsersPending) return actionsNeeded.respondToInvitation as string;
    if (allUsersDeclined) return actionsNeeded.noOneIsComing as string;
    if (!addressValidated) return actionsNeeded.submitAnAddress as string;
    return actionsNeeded.noActionsNeeded as string;
  }, [matchingUsers, familyUnit, user]);

  return {
    mixedBackgroundSx,
    mode,
    invitationCode,
    firstName,
    error,
    handleChange,
    matchingUsers,
    setMatchingUsers,
    getFamilyQuery,
    setUserIsAttending,
    familyUnit,
    setFamilyUnitAddress,
    addressValidated,
    handleClick,
    allUsersPending,
    actionNeededMessage,
  };
};