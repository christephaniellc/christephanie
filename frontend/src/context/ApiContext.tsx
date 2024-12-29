import { UserApi } from '@/services/apiService';
import React, { useContext } from 'react';

interface ApiContextProps {
  userApi: UserApi;
}

export const ApiContext = React.createContext({} as ApiContextProps);

export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const userApi = new UserApi();

  return (
    <ApiContext.Provider value={{ userApi }}>
      {props.children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within a ApiContextProvider');
  }
  return context;
};