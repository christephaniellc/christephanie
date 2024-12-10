import {getConfig} from "../../config";
import {AppState, Auth0ProviderOptions, User} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";

export const useAuth0Providers = () => {
  const config = getConfig();
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState, _user?: User) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  const providerConfig: Auth0ProviderOptions = {
    domain: config.domain,
    clientId: config.clientId,
    onRedirectCallback,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(config.audience ? {audience: config.audience} : null),
    },
  };

  return { providerConfig };
};