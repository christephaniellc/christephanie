import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { useCallback } from 'react';

export const useAuth0Utils = () => {
    const { loginWithPopup } = useAuth0();


    const loginUser = useCallback((guestId: string) => {
      loginWithPopup({
        authorizationParams: {
          screen_hint: 'signup',
          guest_id: guestId,
        },
      }).then(()=> {
        console.log('logged in');
      });
    }, [loginWithPopup]);


    return { loginUser };
  }
;