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

    // Clear auth flags first to prevent interference
    sessionStorage.removeItem('auth_in_progress');
    sessionStorage.removeItem('auth_completed_time');
    sessionStorage.removeItem('auth_redirect_to');
    
    // Preserve visited pages before any clearing
    const visitedPages = localStorage.getItem('christephanie_visited_pages');
    
    // Clear application state (but not Auth0 storage yet)
    localStorage.removeItem('user');
    localStorage.removeItem('family');
    
    // Set the return URL
    const homeUrl = window.location.origin + '/';
    
    try {
      console.log('Initiating Auth0 logout with SDK');
      
      // Use Auth0 SDK logout with proper configuration
      await logout({
        logoutParams: {
          returnTo: homeUrl,
          client_id: config.clientId,
          federated: true, // Log out from Identity Provider session
        }
      });
      
      // The above should redirect to Auth0 logout and then back to homeUrl
      // If we somehow reach here, do manual cleanup and redirect
      console.log('Auth0 logout completed, performing manual redirect');
      
      // Only now clear Auth0 data since logout completed
      clearAllAuth0Data(config.clientId);
      
      // Clear remaining storage but restore visited pages
      localStorage.clear();
      sessionStorage.clear();
      if (visitedPages) {
        localStorage.setItem('christephanie_visited_pages', visitedPages);
      }
      
      // Force redirect
      window.location.href = homeUrl;
      
    } catch (error) {
      console.error('Auth0 SDK logout failed:', error);
      
      // If Auth0 SDK logout fails, fall back to direct logout URL
      console.log('Falling back to direct Auth0 logout URL');
      
      // Clear all data before redirect
      clearAllAuth0Data(config.clientId);
      localStorage.clear();
      sessionStorage.clear();
      if (visitedPages) {
        localStorage.setItem('christephanie_visited_pages', visitedPages);
      }
      
      // Use direct Auth0 logout URL as fallback
      forceAuth0Logout();
    }
    
    return Promise.resolve();
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

  // Retry configuration for exponential backoff
  const RETRY_CONFIG = {
    maxAttempts: 4, // Maximum number of retry attempts
    baseDelay: 1000, // Base delay in milliseconds (1 second)
    maxDelay: 30000, // Maximum delay cap (30 seconds)
    backoffMultiplier: 2, // Exponential backoff multipliplier
  };

  // Helper function to calculate delay with exponential backoff
  const calculateRetryDelay = (attempt: number): number => {
    const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
    return Math.min(delay, RETRY_CONFIG.maxDelay);
  };

  // Helper function to determine if an error is retryable
  const isRetryableError = (error: any): boolean => {
    // Don't retry on authentication errors that indicate expired refresh tokens
    if (error.error === 'invalid_grant' || 
        error.message?.includes('invalid_grant') ||
        error.error_description?.includes('invalid_grant') ||
        error.error === 'invalid_request' ||
        error.error === 'unauthorized_client' ||
        error.message?.includes('refresh token') ||
        error.message?.includes('expired') ||
        error.message?.includes('invalid token')) {
      console.log('Refresh token expired or invalid, not retrying');
      return false;
    }
    
    // Retry on network errors, timeouts, and certain temporary Auth0 errors
    if (error.message?.includes('Timeout') || 
        error.message?.includes('timeout') ||
        error.message?.includes('Network') ||
        error.message?.includes('network') ||
        error.error === 'login_required' || // This might be temporary
        error.error === 'consent_required' || // This might be temporary
        error.error_description?.includes('timeout') ||
        error.error_description?.includes('network') ||
        error.name === 'TimeoutError' ||
        error.code === 'NETWORK_ERROR') {
      return true;
    }
    
    return false;
  };

  // Sleep utility for delays
  const sleep = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms));

  // Improved token refresh function with exponential backoff retry logic
  const getAccessTokenPleasePleasePlease = async (): Promise<string | null> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot refresh token');
      throw new Error('User is not authenticated');
    }

    // Add rate limiting to prevent excessive token refreshes
    const now = Date.now();
    const timeSinceLastRefresh = now - lastTokenRefresh.current;
    
    if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
      console.log(`Token refresh requested too soon (${timeSinceLastRefresh}ms since last refresh), throttling`);
      // Wait a bit before allowing another refresh
      await sleep(1000);
    }

    // Update timestamp before making the request
    lastTokenRefresh.current = Date.now();

    let lastError: any = null;
    
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
      try {
        console.log(`Attempting to refresh access token silently (attempt ${attempt}/${RETRY_CONFIG.maxAttempts})`);
        
        // Include specific scope and audience to ensure correct claims
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: config.audience,
            scope: 'openid profile email',
          },
          // Increase timeout for retry attempts
          timeoutInSeconds: 15 + (attempt * 5), // Progressive timeout increase
          // Using 'on' for more reliable caching
          cacheMode: 'on',
          // Add detailed timestamp for debugging
          detailedResponse: true
        });
        
        // Log token details (without exposing the actual token)
        if (token) {
          if (token['id_token']) {
            console.log(`Successfully refreshed access token on attempt ${attempt} with expiry:`, 
              token['expires_at']
                ? new Date(token['expires_at'] * 1000).toISOString()
                : 'unknown');
            return token['access_token'] ? token['access_token'] : token.toString();
          } else {
            console.log(`Successfully refreshed access token on attempt ${attempt}`);
            return token.toString();
          }
        } else {
          throw new Error('No token returned from refresh');
        }
      } catch (error) {
        lastError = error;
        console.error(`Token refresh attempt ${attempt} failed:`, error);

        // Check if we should retry
        if (attempt < RETRY_CONFIG.maxAttempts && isRetryableError(error)) {
          const delay = calculateRetryDelay(attempt);
          console.log(`Retrying token refresh in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts})`);
          await sleep(delay);
          continue;
        } else if (!isRetryableError(error)) {
          console.log('Error is not retryable, stopping retry attempts');
          break;
        } else {
          console.log('Max retry attempts reached, giving up');
          break;
        }
      }
    }

    // If we get here, all retry attempts failed
    console.error('All token refresh attempts failed. Last error:', lastError);
    
    // Don't automatically redirect to login on token refresh failures
    // This prevents login/logout loops caused by temporary Auth0 issues
    console.log('Token refresh failed after all retries, but not automatically redirecting to login to prevent loops');
    
    throw lastError || new Error('Token refresh failed after all retry attempts');
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
