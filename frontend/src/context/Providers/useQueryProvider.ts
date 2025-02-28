import { QueryClient, QueryClientConfig } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';

export const useQueryProvider = () => {
  const { logout } = useAuth0();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        gcTime: 1000 * 60 * 60 * 24,
        staleTime: 1000 * 60 * 60 * 24,
      },
      mutations: {},
    },
  });
  return { queryClient };
};
