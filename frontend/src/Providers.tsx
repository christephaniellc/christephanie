import React from "react";
import "./index.css";
import {Auth0Provider} from "@auth0/auth0-react";
import {useAuth0Providers} from "./hooks/useAuth0Providers";
import {ChristephanieThemeProvider} from "./context/ThemeContext";


export const Providers: React.FC<React.PropsWithChildren> = ({children}) => {
  const {providerConfig} = useAuth0Providers();
  return (
    <ChristephanieThemeProvider>
      <Auth0Provider{...providerConfig}>
        {children}
      </Auth0Provider>
    </ChristephanieThemeProvider>
  )
};