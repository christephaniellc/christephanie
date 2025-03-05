import { QueryClient, QueryClientConfig } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import useNotifications from '@/store/notifications';
import Button from '@mui/material/Button';
import CustomNotification from '@/components/CustomNotification';

export const useQueryProvider = () => {
  const { logout } = useAuth0();
  const [notifications, notificationsActions] = useNotifications();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        gcTime: 1000 * 60 * 60 * 24,
        staleTime: 1000 * 60 * 60 * 24,
      },
      mutations: {
        // Success messages removed as requested
      },
    },
  });
  return { queryClient };
};
