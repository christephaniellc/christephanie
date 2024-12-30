import React, { useContext } from 'react';
import Api from '@/api/Api';
import { useNavigate } from 'react-router-dom';

interface ApiContextProps {
  api: Api;
}

export const ApiContext = React.createContext({} as ApiContextProps);

export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const api = new Api(navigate)

  return (
    <ApiContext.Provider value={{ api }}>
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