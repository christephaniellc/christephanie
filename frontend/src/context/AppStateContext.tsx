import { createContext, ReactNode, useContext } from 'react';
import { useRouteHistory } from './AppState/useRouteHistory';
import { useAppLayout } from './AppState/useAppLayout';

interface AppStateContextProps {
  history: ReturnType<typeof useRouteHistory>['history'];
  previousRoute: ReturnType<typeof useRouteHistory>['previousRoute'];
  navValue: ReturnType<typeof useRouteHistory>['navValue'];
  setNavValue: ReturnType<typeof useRouteHistory>['setNavValue'];
  appLayout: ReturnType<typeof useAppLayout>;
  currentRoute: ReturnType<typeof useRouteHistory>['currentRoute'];
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { history, previousRoute, navValue, setNavValue, currentRoute } = useRouteHistory();
  const appLayout = useAppLayout();
  return (
    <AppStateContext.Provider value={{
      appLayout,
      history,
      previousRoute,
      navValue,
      setNavValue,
      currentRoute,
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