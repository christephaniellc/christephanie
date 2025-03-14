import { LogoutOptions, useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '@/auth_config';
import { useUser } from '@/store/user';
import { useCallback, useContext, useEffect } from 'react';
import { ApiContext } from '@/context/ApiContext';

export const useAuth0Queries = () => {
  const { getAccessTokenSilently, loginWithRedirect, user: auth0User, isAuthenticated, logout } = useAuth0();
  const config = getConfig();
  const [user, userActions] = useUser();
  const apiContext = useContext(ApiContext);

  const logOutFromAuth0 = async () => {
    return await logout({ returnTo: config.returnTo } as LogoutOptions).then(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('family');
    });
  };

  const signInWithAuth0 = useCallback(async (guestId: string) => {
    return await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
        guest_id: guestId,
      },
    });
  }, [loginWithRedirect]);  

  const updateClientInfo = () => {
    // Completely separate this from the auth flow - run it in the background
    // Use a longer timeout to ensure auth is fully complete
    setTimeout(() => {
      try {
        // Fire and forget - don't even await the promise
        apiContext.updateClientInfo().catch(err => {
          console.log('Client info update failed, but this is non-critical:', err);
        });
      } catch (err) {
        console.log('Failed to call client info update, but this is non-critical:', err);
      }
    }, 5000); // Longer delay to ensure auth is complete and app is stable
  };

  const getAccessTokenPleasePleasePlease = async () => {
    try {
      if (!isAuthenticated) throw Error('User is not authenticated');
    } catch (_e) {
      await loginWithRedirect();
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
    console.debug('auth0User', auth0User);
    if (auth0User && !user.auth0Id) {
      const newUser = {
        ...user,
        auth0Id: auth0User?.sub,
      };
      userActions.setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Fire and forget client info update
      updateClientInfo();
    }
  }, [auth0User, userActions.setUser, user]);

  return { getAccessTokenPleasePleasePlease, logOutFromAuth0, signInWithAuth0, updateClientInfo };
};