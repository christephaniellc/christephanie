// useAddressAutocomplete.ts
import { useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useAddress } from './AddressContext';

const libraries: ('places')[] = ['places'];

export const useAddressAutocomplete = () => {
  const { setAddress } = useAddress();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isAutocompleteEnabled = process.env.NODE_ENV === 'production';

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  useEffect(() => {
    if (isAutocompleteEnabled && isLoaded && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          setAddress(place.formatted_address);
        }
      });
    }
  }, [isAutocompleteEnabled, isLoaded, setAddress]);

  return { inputRef, isAutocompleteEnabled };
};
