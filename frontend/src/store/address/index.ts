import { atom, selector } from 'recoil';
import { familyState } from '@/store/family';
import { AddressDto } from '@/types/api';

export const streetAddressState = atom<string>({
  key: 'streetAddress',
  default: '',
});

export const secondaryAddressState = atom<string>({
  key: 'secondaryAddress',
  default: '',
});

export const cityAddressState = atom<string>({
  key: 'city',
  default: '',
});

export const stateAddressState = atom<string>({
  key: 'state',
  default: '',

});

export const zipCodeAddressState = atom<string>({
  key: 'zipCode',
  default: '',
});

export const addressState = selector({
  key: 'address',
  get: ({ get }) => {
    const streetAddress = get(streetAddressState);
    const secondaryAddress = get(secondaryAddressState);
    const city = get(cityAddressState);
    const state = get(stateAddressState);
    const zipCode = get(zipCodeAddressState);
    console.log('getting address', { streetAddress, secondaryAddress, city, state, zipCode });
    return {
      streetAddress,
      secondaryAddress,
      city,
      state,
      zipCode,
    };
  },
});