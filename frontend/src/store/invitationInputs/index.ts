import { atom } from 'recoil';

export const invitationCodeState = atom<string>({
  key: 'invitationCode',
  default: '',
});

export const firstNameState = atom<string>({
  key: 'firstName',
  default: '',
});