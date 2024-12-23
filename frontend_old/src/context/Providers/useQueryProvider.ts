import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

export const useQueryProvider = () => {
  const queryClient = new QueryClient(
    {
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    }
  );
  return { queryClient };
}