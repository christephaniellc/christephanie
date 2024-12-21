import React from 'react';
import '../../index.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { useAuth0Providers } from './useAuth0Providers';
import { ChristephanieThemeProvider } from '../ThemeContext';
import { useQueryProvider } from './useQueryProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { RsvpProvider } from '../Rsvp/RsvpContext';
import { AddressProvider } from '../Address/AddressContext';
import { AppStateContextProvider } from '../AppStateContext';

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { providerConfig } = useAuth0Providers();
  const { queryClient } = useQueryProvider();
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateContextProvider>
        <ChristephanieThemeProvider>
          <RsvpProvider>
            <AddressProvider>
              <Auth0Provider{...providerConfig}>
                {children}
              </Auth0Provider>
            </AddressProvider>
          </RsvpProvider>
        </ChristephanieThemeProvider>
      </AppStateContextProvider>
    </QueryClientProvider>
  );
};
