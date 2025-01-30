import React, { useContext, useEffect } from 'react';
import Api from '@/api/Api';
import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';

type ApiContextProps = Api;


export const ApiContext = React.createContext({} as ApiContextProps);

export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const user = useRecoilValue(userState);
  const { getAccessTokenSilently } = useAuth0();


  const getTokenFunc = React.useCallback(async () => {
    try {
      console.log('getting token');
      return await getAccessTokenSilently();
    } catch (err) {
      console.error('Failed to get token', err);
      return null;
    }
  }, [getAccessTokenSilently, user]);

  const apiRef = React.useRef(new Api(getTokenFunc));

  useEffect(() => {
    apiRef.current = new Api(getTokenFunc);
  }, [user]);

  return (
    <ApiContext.Provider value={apiRef.current}>
      {props.children}
    </ApiContext.Provider>
  );
};

export const useApiContext = () => {
  const api = useContext(ApiContext);
  if (api === undefined) {
    throw new Error('useApi must be used within a ApiContextProvider');
  }

  return api;
};