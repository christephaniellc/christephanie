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

  // Helper function to handle refresh token expiry with silent re-authentication
  const handleRefreshTokenExpiry = async (): Promise<string | null> => {
    console.log('Refresh token expired, attempting silent re-authentication');
    
    try {
      // Try to get a token using a popup (doesn't interrupt the user's flow)
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: config.audience,
          scope: 'openid profile email',
          prompt: 'none', // Don't show login UI
        },
        cacheMode: 'off', // Force fresh request
        timeoutInSeconds: 10,
      });
      
      console.log('Silent re-authentication successful');
      return typeof token === 'string' ? token : (token as any)?.access_token || null;
      
    } catch (silentError) {
      console.log('Silent re-authentication failed, checking if interactive auth is needed:', silentError);
      
      // If silent auth fails, we need interactive authentication
      // Try redirect-based authentication (preserves current page state)
      try {
        console.log('Attempting redirect-based re-authentication');
        
        // Store current page info for return after auth
        sessionStorage.setItem('auth_in_progress', 'true');
        sessionStorage.setItem('pre_auth_path', window.location.pathname + window.location.search);
        
        // Trigger redirect-based authentication
        await loginWithRedirect({
          authorizationParams: {
            audience: config.audience,
            scope: 'openid profile email',
            prompt: 'login',
            redirect_uri: window.location.origin,
          },
          appState: {
            returnTo: window.location.pathname + window.location.search
          }
        });
        
        // This will redirect away, so we won't reach here
        return null;
        
      } catch (redirectError) {
        console.error('Redirect-based authentication failed:', redirectError);
        
        // If even redirect fails, we have a serious issue
        throw new Error('All re-authentication methods failed');
      }
    }
  };

  // Improved token refresh function with exponential backoff retry logic
  const getAccessTokenPleasePleasePlease = async (): Promise<string | null> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot refresh token');
      
      // Check if user exists but isAuthenticated is still false (Auth0 race condition)
      if (auth0User) {
        console.log('Auth0 user exists but isAuthenticated is false, waiting for Auth0 state to sync...');
        
        // Wait a bit for Auth0 state to synchronize
        await sleep(2000);
        
        // Check again after waiting
        if (!isAuthenticated) {
          console.log('Still not authenticated after waiting, throwing error');
          throw new Error('User is not authenticated');
        } else {
          console.log('Authentication state synchronized, proceeding with token refresh');
        }
      } else {
        throw new Error('User is not authenticated');
      }
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
        
        // Log detailed error information for debugging
        if (error && typeof error === 'object') {
          console.error('Error details:', {
            error: (error as any).error,
            error_description: (error as any).error_description,
            message: (error as any).message,
            name: (error as any).name,
            code: (error as any).code
          });
        }

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
    
    // Check if this looks like a refresh token expiry
    // Be more aggressive in detecting expired refresh tokens
    const isRefreshTokenExpired = lastError?.error === 'invalid_grant' || 
        lastError?.message?.includes('invalid_grant') ||
        lastError?.error_description?.includes('invalid_grant') ||
        lastError?.error === 'invalid_request' ||
        lastError?.error === 'unauthorized_client' ||
        lastError?.error === 'login_required' ||
        lastError?.message?.includes('refresh token') ||
        lastError?.message?.includes('expired') ||
        lastError?.message?.includes('invalid token') ||
        lastError?.message?.includes('Forbidden') ||
        lastError?.message?.includes('unauthorized') ||
        lastError?.message?.includes('Authentication failed') ||
        // If Auth0 getAccessTokenSilently consistently fails, likely expired refresh token
        (lastError?.name === 'TimeoutError') ||
        // Generic fallback - if all retry attempts failed and it's not a clear network issue
        (!lastError?.message?.includes('network') && !lastError?.message?.includes('Network') && 
         !lastError?.message?.includes('timeout') && !lastError?.message?.includes('Timeout'));
    
    if (isRefreshTokenExpired) {
      console.log('Refresh token appears to be expired, attempting graceful re-authentication');
      
      try {
        // Try graceful re-authentication instead of forcing logout
        const newToken = await handleRefreshTokenExpiry();
        if (newToken) {
          console.log('Graceful re-authentication successful, got new token');
          return newToken;
        }
      } catch (reAuthError) {
        console.error('Graceful re-authentication failed:', reAuthError);
      }
      
      // If graceful re-auth fails, the handleRefreshTokenExpiry function will handle redirect
      throw lastError || new Error('Refresh token expired and re-authentication failed');
    }
    
    // For non-refresh-token errors, don't force login to prevent loops
    console.log('Token refresh failed due to temporary issue, not forcing logout to prevent auth loops');
    
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

  // Proactive token renewal - check and renew tokens before they expire
  const proactiveTokenRenewal = useCallback(async () => {
    if (!isAuthenticated || !auth0User) {
      return;
    }

    try {
      // Try to get a fresh token silently
      // This will work as long as the refresh token is valid
      await getAccessTokenSilently({
        authorizationParams: {
          audience: config.audience,
          scope: 'openid profile email',
        },
        cacheMode: 'off', // Force fresh request
        timeoutInSeconds: 10,
      });
      
      console.log('Proactive token renewal successful');
    } catch (error) {
      console.log('Proactive token renewal failed, will handle on-demand:', error);
      // Don't throw - this is just proactive, will handle on-demand later
    }
  }, [isAuthenticated, auth0User, getAccessTokenSilently, config.audience]);

  // Set up proactive token renewal (every 30 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      console.log('Running proactive token renewal...');
      proactiveTokenRenewal();
    }, 30 * 60 * 1000); // 30 minutes

    // Also run once on initial auth
    const timeout = setTimeout(() => {
      proactiveTokenRenewal();
    }, 5000); // 5 seconds after auth

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAuthenticated, proactiveTokenRenewal]);

  return {
    getAccessTokenPleasePleasePlease,
    handleRefreshTokenExpiry,
    proactiveTokenRenewal,
    logOutFromAuth0,
    signInWithAuth0,
    updateClientInfo,
    simulateTokenExpiry, // Include this for testing purposes
  };
};
