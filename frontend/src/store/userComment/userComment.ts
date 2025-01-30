import { atom } from 'recoil';

export const userCommentState = atom<string>({
  key: 'userComment',
  default: '',
});