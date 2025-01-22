import { atom, selector } from 'recoil';
import { userIdQueryState, userState } from '@/store/user';

export const findUserState = atom<boolean>({
  key: 'findUser',
  default: false,
});


export const invitationButtonSelectorState = selector<string>({
  key: 'createAcctButtonText',
  get: ({ get }) => {
    const userIdQuery = get(userIdQueryState);
    const user = get(userState);

    const firstName = user?.firstName;
    const invitationCode = user?.invitationCode;

    if (userIdQuery?.isLoading) return 'Checking guest list';
    if (userIdQuery?.error && userIdQuery?.error?.status) {
      switch (userIdQuery.error.status) {
        case 404:
        case 400:
          return userIdQuery.error.description;
        default:
          return userIdQuery.error.status;

      }
    }

    if (!user?.guestId) {
      const pleaseEnter = [];
      if (!firstName) pleaseEnter.push('first name');
      if (!invitationCode) pleaseEnter.push('invitation code');
      if (!(firstName && invitationCode)) return `Please enter your ${pleaseEnter.join(' and ')}`;
      return "Check Guest List";
    }
    if (!userIdQuery) return 'Check Guest List';
    if (user.guestId) return `Guest Found! Login or Create Acct`;

    if (user?.guestId && !user?.auth0Id) {
      if (user.auth0Id) return 'Account Created!';
      if (user.guestId) return 'Create Account';
    }
    return `${userIdQuery?.data}`;
  }
});

export const queryKeySelector = selector<string>({
  key: 'queryKey',
  get: ({ get }) => {
    const user= get(userState);
    return `invitationCode=${user?.invitationCode}&firstName=${user?.firstName}`;
  },
});