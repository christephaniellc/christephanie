import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { useCallback } from 'react';

export const useAuth0Utils = () => {
    const { loginWithRedirect } = useAuth0();


    const loginUser = useCallback((guestId: string) => {
      loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          guest_id: guestId,
        },
      }).then(()=> {
        console.log('Logged in');
      });
    }, [loginWithRedirect]);


    return { loginUser };
  }
;