import {AppState, Auth0ProviderOptions, User} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";
import { getConfig } from '@/browser-config';

export const useAuth0Providers = () => {
  const navigate = useNavigate();
  const config = getConfig();
  const onRedirectCallback = (appState?: AppState, _user?: User) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  const providerConfig: Auth0ProviderOptions = {
    domain: config.domain,
    clientId: config.clientId,
    onRedirectCallback,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(config.audience ? {audience: config.audience} : { }),
    },
  };

  return { providerConfig };
};