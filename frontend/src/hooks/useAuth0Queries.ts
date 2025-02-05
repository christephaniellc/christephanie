import { useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '@/auth_config';
import { useUser } from '@/store/user';
import { useCallback, useEffect } from 'react';

export const useAuth0Queries = () => {
  const { getAccessTokenSilently, loginWithPopup, user: auth0User, isAuthenticated, logout,  } = useAuth0();
  const config = getConfig();
  const [user, userActions] = useUser();


  const logOutFromAuth0 = async () => {
    return await logout().then(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('family');
    });
  };

  const signInWithAuth0 = useCallback(async (guestId: string) => {
    return await loginWithPopup({
      authorizationParams: {
        screen_hint: 'signup',
        guest_id: guestId,
      },
    });
  }, []);
  const getAccessTokenPleasePleasePlease = async () => {
    try {
      if (!isAuthenticated) throw Error('User is not authenticated');
    } catch (_e) {
      await loginWithPopup();
    } finally {
      console.log('getting access token');
      await getAccessTokenSilently({
        authorizationParams: {
          audience: config.audience,
        },
      });
    }
  };

  useEffect(() => {
    console.log('auth0User', auth0User);
    if (auth0User && !user.auth0Id) {
      const newUser = {
        ...user,
        auth0Id: auth0User?.sub,
      };
      userActions.setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  }, [auth0User, userActions.setUser, user]);

  return { getAccessTokenPleasePleasePlease, logOutFromAuth0, signInWithAuth0 };
};