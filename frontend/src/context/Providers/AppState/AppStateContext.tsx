import { createContext, ReactNode, useContext } from 'react';
import { useRouteHistory } from './useRouteHistory';
import { useAppLayout } from './useAppLayout';

interface AppStateContextProps {
  routeHistory: ReturnType<typeof useRouteHistory>;
  appLayout: ReturnType<typeof useAppLayout>;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateContextProvider = ({ children }: {children: ReactNode}) => {
  const routeHistory = useRouteHistory();
  const appLayout = useAppLayout();
  return (
    <AppStateContext.Provider value={{
      routeHistory,
      appLayout,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppStateContext = (): AppStateContextProps => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};