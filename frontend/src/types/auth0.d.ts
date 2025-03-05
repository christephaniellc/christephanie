declare module '@auth0/auth0-react' {
  export interface RedirectLoginOptions {
    redirectUri?: string;
    appState?: AppState;
    [key: string]: any;
  }

  export interface PopupLoginOptions {
    popup?: any;
    [key: string]: any;
  }

  export interface GetTokenSilentlyOptions {
    audience?: string;
    scope?: string;
    [key: string]: any;
  }

  export interface GetTokenWithPopupOptions {
    [key: string]: any;
  }

  export interface IdToken {
    __raw: string;
    [key: string]: any;
  }
  export interface Auth0ContextInterface<TUser extends User = User> {
    isAuthenticated: boolean;
    isLoading: boolean;
    error?: Error;
    user?: TUser;
    loginWithRedirect: (opts?: RedirectLoginOptions) => Promise<void>;
    loginWithPopup: (opts?: PopupLoginOptions) => Promise<void>;
    logout: (opts?: LogoutOptions) => Promise<void>;
    getAccessTokenSilently: (opts?: GetTokenSilentlyOptions) => Promise<string>;
    getAccessTokenWithPopup: (opts?: GetTokenWithPopupOptions) => Promise<string>;
    getIdTokenClaims: () => Promise<IdToken>;
  }

  export interface User {
    name?: string;
    given_name?: string;
    family_name?: string;
    middle_name?: string;
    nickname?: string;
    preferred_username?: string;
    profile?: string;
    picture?: string;
    website?: string;
    email?: string;
    email_verified?: boolean;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
    address?: string;
    updated_at?: string;
    sub?: string;
    [key: string]: any;
  }

  export interface AppState {
    returnTo?: string;
    [key: string]: any;
  }

  export interface LogoutOptions {
    returnTo?: string;
    clientId?: string;
    federated?: boolean;
    [key: string]: any;
  }

  export interface Auth0ProviderOptions {
    domain: string;
    clientId: string;
    redirectUri?: string;
    audience?: string;
    scope?: string;
    onRedirectCallback?: (appState: AppState) => void;
    [key: string]: any;
  }

  export const useAuth0: () => Auth0ContextInterface;
  export const Auth0Provider: React.FC<Auth0ProviderOptions & { children: React.ReactNode }>;
}