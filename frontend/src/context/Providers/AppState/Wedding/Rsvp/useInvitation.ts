import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useInvitation = () => {
  const { user } = useAuth0();

  const actionNeededMessage: string = useMemo(() => {
    const actionsNeeded = {
      findUser: 'Find your invitation',
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
    return actionsNeeded.noActionsNeeded as string;
  }, [user]);

  return {
    actionNeededMessage,
  };
};