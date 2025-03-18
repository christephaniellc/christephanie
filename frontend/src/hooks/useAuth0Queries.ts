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
    // Clear Auth0-specific tokens first
    const auth0CacheKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('@@auth0spajs@@') || 
      key.includes(config.clientId) ||
      key.includes('auth0')
    );
    
    auth0CacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear application state
    localStorage.removeItem('user');
    localStorage.removeItem('family');
    sessionStorage.removeItem('auth_redirect_to');
    
    // Then call Auth0 logout - this has to be last as it navigates away
    return await logout({
      returnTo: config.returnTo,
      // Set explicit options to ensure clean logout
      clientID: config.clientId,
      federated: true // Log out from Auth0 session as well
    } as LogoutOptions).then(() => {
      // As a final precaution, clear any remaining localStorage
      localStorage.clear();
      // Force a complete page reload to reset all app state
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/';
      }
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
        if (apiContext && apiContext.updateClientInfo) {
          apiContext.updateClientInfo().catch((err) => {
            console.log('Client info update failed, but this is non-critical:', err);
          });
        }
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
      
      // Try to get token from cache first
      try {
        const cachedToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: config.audience,
            scope: 'openid profile email offline_access'
          },
          timeoutInSeconds: 5
        });
        
        if (cachedToken) {
          console.log('Successfully got access token from cache');
          return cachedToken;
        }
      } catch (cacheError) {
        console.log('Cache retrieval failed, will try with auth params:', cacheError);
        // Continue to the next attempt
      }
      
      // If cached token failed or wasn't available, try a fresh request
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: config.audience,
          scope: 'openid profile email offline_access',
          redirect_uri: window.location.origin
        },
        timeoutInSeconds: 15,
        // Don't use detailedResponse because it causes typing issues
      });

      console.log('Successfully refreshed access token');
      return token;
    } catch (error) {
      console.error('Failed to get access token silently:', error);
      
      // Handle the specific Missing Refresh Token error
      if (error instanceof Error && 
          (error.message.includes('Missing Refresh Token') || 
           error.message.includes('invalid_grant'))) {
        
        console.log('Refresh token missing or invalid, initiating a new login flow');
        
        // Don't redirect immediately to avoid interrupting user experience
        // Instead, return a valid but dummy token to keep the app running temporarily
        // and schedule a redirect for later
        
        setTimeout(() => {
          // Display a friendly message about re-login
          if (confirm('Your session needs to be renewed. Click OK to log in again.')) {
            loginWithRedirect({
              authorizationParams: {
                audience: config.audience,
                scope: 'openid profile email offline_access',
                prompt: 'login' // Force a fresh login
              },
              appState: {
                returnTo: window.location.pathname
              }
            });
          }
        }, 500);
        
        // Return null to signal the token isn't available but we've handled it
        return null;
      }

      // For other errors, try redirect login if appropriate
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
            scope: 'openid profile email offline_access'
          },
          appState: {
            returnTo: window.location.pathname
          }
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
