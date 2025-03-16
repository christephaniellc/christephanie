import { LogoutOptions, useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '@/auth_config';
import { useUser } from '@/store/user';
import { useCallback, useContext, useEffect } from 'react';
import { ApiContext } from '@/context/ApiContext';

export const useAuth0Queries = () => {
  const {
    getAccessTokenSilently,
    loginWithRedirect,
    user: auth0User,
    isAuthenticated,
    logout,
  } = useAuth0();
  const config = getConfig();
  const [user, userActions] = useUser();
  const apiContext = useContext(ApiContext);

  const logOutFromAuth0 = async () => {
    return await logout({ returnTo: config.returnTo } as LogoutOptions).then(() => {
      localStorage.clear();
    });
  };

  const signInWithAuth0 = useCallback(
    async (guestId: string) => {
      return await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          guest_id: guestId,
        },
      });
    },
    [loginWithRedirect],
  );

  const updateClientInfo = () => {
    // Completely separate this from the auth flow - run it in the background
    // Use a longer timeout to ensure auth is fully complete
    setTimeout(() => {
      try {
        // Fire and forget - don't even await the promise
        apiContext.updateClientInfo().catch((err) => {
          console.log('Client info update failed, but this is non-critical:', err);
        });
      } catch (err) {
        console.log('Failed to call client info update, but this is non-critical:', err);
      }
    }, 5000); // Longer delay to ensure auth is complete and app is stable
  };

  // Improved token refresh function with better error handling
  const getAccessTokenPleasePleasePlease = async () => {
    try {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        throw new Error('User is not authenticated');
      }

      console.log('Attempting to refresh access token silently');
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: config.audience,
        },
        // Set timeoutInSeconds to a lower value for faster testing
        timeoutInSeconds: 10,
        // Force a refresh rather than using a cached token
        cacheMode: 'off',
      });

      console.log('Successfully refreshed access token');
      return token;
    } catch (error) {
      console.error('Failed to get access token silently:', error);

      // If silent refresh fails, try redirect login
      if (
        error instanceof Error &&
        (error.message.includes('login_required') ||
          error.message.includes('consent_required') ||
          error.message.includes('interaction_required') ||
          error.message === 'User is not authenticated')
      ) {
        console.log('Silent refresh failed, redirecting to login');
        await loginWithRedirect({
          authorizationParams: {
            audience: config.audience,
          },
        });
      }

      throw error; // Propagate the error for handling upstream
    }
  };

  // Helper function specifically for testing token expiry scenarios
  const simulateTokenExpiry = async () => {
    // This would only be used in development/testing
    // Check if we're in production based on window.location.hostname
    const isProduction =
      typeof window !== 'undefined' && window.location.hostname === 'www.wedding.christephanie.com';

    if (!isProduction) {
      console.log('Simulating token expiry for testing');
      localStorage.removeItem(
        '@@auth0spajs@@::' + config.clientId + '::' + config.audience + '::openid profile email',
      );
      return true;
    }
    return false;
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

  return {
    getAccessTokenPleasePleasePlease,
    logOutFromAuth0,
    signInWithAuth0,
    updateClientInfo,
    simulateTokenExpiry, // Include this for testing purposes
  };
};
