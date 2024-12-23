import React from 'react';
import '../index.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { useAuth0Providers } from './Providers/useAuth0Providers';
import { ChristephanieThemeProvider } from './Providers/AppState/ThemeContext';
import { useQueryProvider } from './Providers/useQueryProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { RsvpProvider } from './Providers/AppState/Wedding/Rsvp/RsvpContext';
import { AddressProvider } from './Providers/AppState/Wedding/Rsvp/Address/AddressContext';
import { AppStateContextProvider } from './Providers/AppState/AppStateContext';
import { CommonContextProvider } from './CommonContext';

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { providerConfig } = useAuth0Providers();
  const { queryClient } = useQueryProvider();
  return (
    <CommonContextProvider>
      <Auth0Provider{...providerConfig}>
        <QueryClientProvider client={queryClient}>
          <AppStateContextProvider>
            <ChristephanieThemeProvider>
              <RsvpProvider>
                <AddressProvider>
                  {children}
                </AddressProvider>
              </RsvpProvider>
            </ChristephanieThemeProvider>
          </AppStateContextProvider>
        </QueryClientProvider>
      </Auth0Provider>
    </CommonContextProvider>
  );
};
