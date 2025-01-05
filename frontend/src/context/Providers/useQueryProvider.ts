import {QueryClient, QueryClientConfig} from '@tanstack/react-query';

export const useQueryProvider = () => {
    const queryClient = new QueryClient(
        {
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false,
                    refetchOnMount: false,
                    refetchOnReconnect: false,
                    gcTime: 1000 * 60 * 60 * 24,
                    staleTime: 1000 * 60 * 60 * 24,
                },
            },
        }
    );
    return {queryClient};
}