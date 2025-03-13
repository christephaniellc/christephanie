import {AppState, Auth0ProviderOptions, User} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";
import { getConfig } from '@/auth_config';

export const useAuth0Providers = () => {
  const navigate = useNavigate();
  const config = getConfig();
  const onRedirectCallback = (appState?: AppState, _user?: User) => {
    // Keep it simple - just store the path and let the browser handle the redirect
    const targetPath = appState?.returnTo || window.location.pathname;
    console.log("Auth0 redirect callback - storing navigation target:", targetPath);
    
    // Store where to navigate after auth is complete
    sessionStorage.setItem('auth_redirect_to', targetPath);
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
  };

  return { providerConfig };
};