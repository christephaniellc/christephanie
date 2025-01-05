import { atom } from 'recoil';
import { GuestDto } from '@/types/api';

export const userState = atom<GuestDto | null>({
  key: 'user',
  default: null,
});

