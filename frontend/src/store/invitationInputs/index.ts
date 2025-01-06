import { atom, selector } from 'recoil';
import { userSelector, userIdQueryState } from '@/store/user';
import { useAuth0 } from '@auth0/auth0-react';
import { UseQueryResult } from '@tanstack/react-query';

export const invitationCodeState = atom<string>({
  key: 'invitationCode',
  default: '',
});

export const firstNameState = atom<string>({
  key: 'firstName',
  default: '',
});

export const findUserState = atom<boolean>({
  key: 'findUser',
  default: false,
});


export const invitationButtonSelectorState = selector<string>({
  key: 'createAcctButtonText',
  get: ({ get }) => {
    const invitationCode = get(invitationCodeState);
    const firstName = get(firstNameState);
    const userIdQuery = get(userIdQueryState);
    const user = get(userSelector);

    if (userIdQuery?.isFetching) return 'Checking guest list';
    if (userIdQuery?.error) return userIdQuery?.error.message;

    if (!userIdQuery?.data) {
      const pleaseEnter = [];
      if (!firstName) pleaseEnter.push('first name');
      if (!invitationCode) pleaseEnter.push('invitation code');
      if (!(firstName && invitationCode)) return `Please enter your ${pleaseEnter.join(' and ')}`;
    }
    if (userIdQuery?.data) {
      if (user.auth0Id) return 'Account Created!';
      if (user.guestId) return 'Create Account';
    }
    return `${userIdQuery?.data}`;
  }
});

export const queryKeySelector = selector<string>({
  key: 'queryKey',
  get: ({ get }) => {
    const invitationCode = get(invitationCodeState);
    const firstName = get(firstNameState);
    return `invitationCode=${invitationCode}&firstName=${firstName}`;
  },
});