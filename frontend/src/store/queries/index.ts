import { atom } from 'recoil';

export const queries = atom<Map<string, string[]>>({
  key: 'queryKeys',
  default: {
    'findGuest': new Map()
  },
});