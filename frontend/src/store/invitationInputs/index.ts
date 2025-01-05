import { atom, selector } from 'recoil';

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

    const pleaseEnter = [];
    if (!firstName) pleaseEnter.push('first name');
    if (!invitationCode) pleaseEnter.push('invitation code');

    return `Please enter your ${pleaseEnter.join(' and ')}`;
    // if (firstName && invitationCode) pleaseEnter = ['Checking Guest List'];
    // if (!user?.data) return 'Create Account';
    // if (user?.isFetching) return 'Checking guest List';
    // if (user?.data) return 'Account Created!';
    // if (user.error) return user.error.message;
  },
});