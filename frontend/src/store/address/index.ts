import { atom, selector } from 'recoil';
import { familyState } from '@/store/family';
import { AddressDto, } from '@/types/api';

export const streetAddressState = atom<string | null | undefined>({
  key: 'streetAddress',
  default: '',
});

export const secondaryAddressState = atom<string | null | undefined>({
  key: 'secondaryAddress',
  default: '',
});

export const cityAddressState = atom<string | null | undefined>({
  key: 'city',
  default: '',
});

export const stateAddressState = atom<string | null | undefined>({
  key: 'state',
  default: '',

});

export const zipCodeAddressState = atom<string | null | undefined>({
  key: 'zipCode',
  default: '',
});

export const addressState = selector({
  key: 'address',
  get: ({ get }): AddressDto | null => {
    const familyUnitAddress = get(familyState)?.mailingAddress;
    const streetAddress = get(streetAddressState);
    const secondaryAddress = get(secondaryAddressState);
    const city = get(cityAddressState);
    const state = get(stateAddressState);
    const zipCode = get(zipCodeAddressState);
    console.log('getting address', { streetAddress, secondaryAddress, city, state, zipCode });
    let newAddress: AddressDto | null = null;
    if (familyUnitAddress) {
      newAddress = familyUnitAddress;
    }
    newAddress = {
      ...newAddress,
      streetAddress,
      secondaryAddress,
      city,
      state,
      zipCode,
    };

    return newAddress || null;
  }
});