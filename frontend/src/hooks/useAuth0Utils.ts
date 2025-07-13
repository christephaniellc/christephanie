import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { useCallback } from 'react';

export const useAuth0Utils = () => {
    const { loginWithRedirect } = useAuth0();


    const loginUser = useCallback((guestId: string) => {
      // Clear any existing auth flags first
      sessionStorage.removeItem('auth_in_progress');
      sessionStorage.removeItem('auth_completed_time');
      
      // Set fresh auth flag to prevent service worker conflicts
      sessionStorage.setItem('auth_in_progress', 'true');
      
      loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          guest_id: guestId,
          prompt: 'login', // Force Auth0 to show login page
        },
      }).then(()=> {
        console.log('Logged in');
      }).catch((error) => {
        console.error('Login failed:', error);
        // Clear auth flag on error
        sessionStorage.removeItem('auth_in_progress');
      });
    }, [loginWithRedirect]);


    return { loginUser };
  }
;