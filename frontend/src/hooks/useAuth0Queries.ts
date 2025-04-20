import { LogoutOptions, useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '@/auth_config';
import { useUser } from '@/store/user';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { ApiContext } from '@/context/ApiContext';
import { clearAllAuth0Data, forceAuth0Logout } from '@/utils/auth0-cleanup';

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
    console.log('Performing complete Auth0 logout');
    
    // Reset our refresh tracking state
    lastTokenRefresh.current = 0;
    
    // Clear API token cache if available
    if (apiContext && apiContext.clearTokenCache) {
      console.log('Clearing API token cache');
      apiContext.clearTokenCache();
    }

    // Use our dedicated utility to clear ALL Auth0 data
    clearAllAuth0Data(config.clientId);
    
    // Clear application state
    localStorage.removeItem('user');
    localStorage.removeItem('family');
    sessionStorage.removeItem('auth_redirect_to');

    // Retain visited pages
    let visitedPages = localStorage.getItem('christephanie_visited_pages');

    // NEW: Perform nuclear cleanup
    localStorage.clear();
    sessionStorage.clear();    

    // Restore visited pages
    localStorage.setItem('christephanie_visited_pages', visitedPages);

    // Navigate directly to Auth0 logout endpoint
    forceAuth0Logout();
    
    // Ensure returnTo is set to the home page
    const homeUrl = window.location.origin + '/';
    
    // Then call Auth0 logout with all cleanup options
    try {
      // Set strongest possible logout options
      const logoutOptions: LogoutOptions = {
        returnTo: homeUrl, // Always return to home page
        clientID: config.clientId,
        federated: true, // Log out from Identity Provider session
        openUrl: true,   // Let Auth0 handle the redirect
      };
      
      console.log('Calling Auth0 logout with options:', logoutOptions);
      
      // First attempt with openUrl:false to try to handle it programmatically
      try {
        await logout({
          ...logoutOptions,
          openUrl: false
        } as LogoutOptions);
        
        // If we reach here, logout succeeded but we need to redirect manually
        console.log('Logout successful, redirecting to home page');
        window.location.href = homeUrl + '?logout=' + Date.now();
      } catch (err) {
        console.log('First logout attempt failed, trying with openUrl:true', err);
        // This will automatically redirect to returnTo
        await logout(logoutOptions);
      }
    } catch (error) {
      console.error('Error during Auth0 logout:', error);
      
      // If Auth0 logout fails, perform manual cleanup and redirect
      // As a final precaution, clear ALL localStorage and sessionStorage
      console.log('Final storage cleanup after failed logout');
      localStorage.clear();
      sessionStorage.clear();
      
      // Last resort: Use the direct Auth0 logout URL
      console.log('Using direct Auth0 logout URL as final fallback');
      forceAuth0Logout();
    }
    
    return Promise.resolve(); // Resolve the promise to indicate logout completion
  };

  const signInWithAuth0 = useCallback(
    async (guestId: string, auth0Id?: string) => {
      // Clear any existing Auth0 session first to force a fresh login
      clearAllAuth0Data(config.clientId);
      
      // Add a small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force a completely new authentication flow with prompt=login
      return await loginWithRedirect({
        authorizationParams: {
          screen_hint: auth0Id ? 'login' : 'signup',
          guest_id: guestId,
          redirect_uri: window.location.origin,
          prompt: 'login', // Force Auth0 to show the login page, ignoring any existing session
        },
        // Always create a new transaction
        appState: { 
          invitationFlow: true,
          timestamp: Date.now(), 
          guestId,
          returnTo: '/' // Explicitly set returnTo to the home/welcome page
        }
      });
    },
    [loginWithRedirect, config.clientId],
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
      if (token) {
        if (token['id_token']) {
          console.log('Successfully refreshed access token with expiry:', 
            token['expires_at']
              ? new Date(token['expires_at'] * 1000).toISOString()
              : 'unknown');
          return token['access_token'] ? token['access_token'] : token.toString();
        } else {
          console.log('Successfully refreshed access token');
          return token.toString();
        }
      } else {
        console.log('Token refresh completed but no token returned');
        throw new Error('No token returned from refresh');
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
