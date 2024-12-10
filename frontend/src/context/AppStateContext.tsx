import { createContext, ReactNode, useContext } from 'react';
import { useRouteHistory } from './AppState/useRouteHistory';
import { useAppLayout } from './AppState/useAppLayout';

interface AppStateContextProps {
    history: ReturnType<typeof useRouteHistory>['history'];
    previousRoute: ReturnType<typeof useRouteHistory>['previousRoute'];
    navValue: ReturnType<typeof useAppLayout>['navValue'];
    setNavValue: ReturnType<typeof useAppLayout>['setNavValue'];
    screenWidth: ReturnType<typeof useAppLayout>['screenWidth'];
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const { history, previousRoute } = useRouteHistory();
    const { navValue, setNavValue, screenWidth } = useAppLayout();
    return (
        <AppStateContext.Provider value={{
            history,
            previousRoute,
            navValue,
            setNavValue,
            screenWidth
        }}>
            {children}
        </AppStateContext.Provider>
    );
};

export const useAppStateContext = (): AppStateContextProps => {
    const context = useContext(AppStateContext)
    if (!context) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};