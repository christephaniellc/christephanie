import React, {useState} from 'react';
import {History} from "history";
import Api from '../api/Api';
import { browserHistory } from '../lib/browserHistory';

interface Props {
  children: React.JSX.Element;
}

interface CommonContextState {
  history: History;
  api: Api;
  redirect: (redirectUri: string) => void;
}

export const CommonContext = React.createContext({} as CommonContextState);

export const CommonContextProvider = (props: Props) => {
  const [history] = useState<History>(browserHistory);
  const [api] = useState<Api>(new Api(browserHistory));

  const redirect = (uri: string) => {
    history.push(uri);
  };

  return (
    <CommonContext.Provider
      value={{
        history,
        api,
        redirect
      }}
    >
      {props.children}
    </CommonContext.Provider>
  );
};

export const useCommonContext = () => {
  const context = React.useContext(CommonContext);
  if (context === undefined) {
    throw new Error('useCommonContext must be used within a CommonContextProvider');
  }
  return context;
}