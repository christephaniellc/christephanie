import { LogoutOptions, useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '@/auth_config';
import { useUser } from '@/store/user';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
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

  // Track the last token refresh timestamp to prevent excessive refreshes
  const lastTokenRefresh = useRef<number>(0);
  const MIN_REFRESH_INTERVAL = 10000; // Minimum 10 seconds between refreshes

  // Improved token refresh function with better error handling and rate limiting
  const getAccessTokenPleasePleasePlease = async () => {
    try {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        throw new Error('User is not authenticated');
      }

      // Add rate limiting to prevent excessive token refreshes
      const now = Date.now();
      const timeSinceLastRefresh = now - lastTokenRefresh.current;
      
      if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
        console.log(`Token refresh requested too soon (${timeSinceLastRefresh}ms since last refresh), throttling`);
        // Wait a bit before allowing another refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update timestamp before making the request
      lastTokenRefresh.current = Date.now();
      
      console.log('Attempting to refresh access token silently');
      // Include specific scope and audience to ensure correct claims
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: config.audience,
          scope: 'openid profile email',
        },
        // Set timeoutInSeconds to a reasonable value
        timeoutInSeconds: 15,
        // Using 'on' for more reliable caching
        cacheMode: 'on',
        // Add detailed timestamp for debugging
        detailedResponse: true
      });
      
      // Log token details (without exposing the actual token)
      if (typeof token === 'object' && token.id_token) {
        console.log('Successfully refreshed access token with expiry:', new Date(token.expires_at * 1000).toISOString());
        return token.access_token;
      } else {
        console.log('Successfully refreshed access token');
        return token;
      }
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
            // Ensure we're requesting all needed scopes
            scope: 'openid profile email',
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
