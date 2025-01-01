import {useLocation} from "react-router-dom";
import { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useRouteHistory = () => {
  const [navValue, setNavValue] = useState<string>("");
  const location = useLocation();
  const [history, setHistory] = useState<string[]>([]);
  const { user } = useAuth0();

  useEffect(() => {
    if (!user) {
    }
  }, [user]);

  useEffect(() => {
    setNavValue(location.pathname);
  }, []);

  useEffect(() => {
    history.push(location.pathname);
  }, [location]);

  const previousRoute = useMemo(() => {
    if (history.length < 2) return null; // No previous route
    return history[history.length - 2];
  }, [history]);

  useEffect(() => {
    setHistory((prev) => {
      if (prev[prev.length - 1] === navValue) return prev;
      return [...prev, navValue];
    });
  }, [navValue]);

  const currentRoute = useMemo(() => {
    return history[history.length - 1];
  }, [history]);

  return { history, previousRoute, navValue, setNavValue, currentRoute, appRoutes };
};

export const appRoutes = {
  Invitation: "/invitation",
  Home: "/",
  Profile: "/profile",
} as const;