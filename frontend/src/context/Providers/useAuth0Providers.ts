import {AppState, Auth0ProviderOptions, User} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";
import { getConfig } from '@/auth_config';

export const useAuth0Providers = () => {
  const navigate = useNavigate();
  const config = getConfig();
  const onRedirectCallback = (appState?: AppState, _user?: User) => {
    try {
      // Parse the state parameter if available
      let parsedState = null;
      if (appState?.state) {
        try {
          parsedState = JSON.parse(appState.state);
        } catch (e) {
          console.warn("Failed to parse Auth0 state param:", e);
        }
      }
      
      // Determine where to redirect
      const targetPath = 
        appState?.returnTo || // First try explicit returnTo from auth flow
        (parsedState?.returnTo || '/'); // Fall back to home/welcome page
        
      console.log("Auth0 redirect callback - navigating to:", targetPath);
      
      // Store it and navigate
      sessionStorage.setItem('auth_redirect_to', targetPath);
      navigate(targetPath);
    } catch (error) {
      console.error("Error in Auth0 redirect callback:", error);
      // Fallback to home if there's any error
      navigate('/');
    }
  };

  const providerConfig: Auth0ProviderOptions = {
    domain: config.domain,
    clientId: config.clientId,    
    onRedirectCallback,
    authorizationParams: {
      redirect_uri: window.location.origin,
      scope: 'openid profile email offline_access',
      ...(config.audience ? {audience: config.audience} : { }),
    },
    cacheLocation: 'localstorage', // Use localStorage instead of sessionStorage
    useRefreshTokens: true, // Enable refresh tokens
    
    // Add these additional Auth0 options to improve token management
    skipRedirectCallback: false, // Process redirect on load
    advancedOptions: {
      defaultScope: 'openid profile email', // Ensure consistent scopes
    },
    useRefreshTokensFallback: true, // Use refreshToken as fallback
    
    // Add session cleanup settings
    logoutParams: {
      federated: true, // Log out from Identity Provider too
      returnTo: window.location.origin + '/', // Always return to home page
    },
  };

  return { providerConfig };
};