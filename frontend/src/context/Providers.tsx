import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useAuth0Providers } from './Providers/useAuth0Providers';
import { useQueryProvider } from './Providers/useQueryProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import ThemeProvider from '@/theme/Provider';
import { ApiContextProvider } from '@/context/ApiContext';
import { AppStateContextProvider } from '@/context/Providers/AppState/AppStateContext';

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { providerConfig } = useAuth0Providers();
  const { queryClient } = useQueryProvider();
  return (
    <ApiContextProvider>
      <Auth0Provider
        domain={providerConfig.domain}
        clientId={providerConfig.clientId}
        onRedirectCallback={providerConfig.onRedirectCallback}
        authorizationParams={providerConfig.authorizationParams}
      >
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <ThemeProvider>
              <AppStateContextProvider>
                {children as JSX.Element}
              </AppStateContextProvider>
            </ThemeProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </Auth0Provider>
    </ApiContextProvider>
  );
};
