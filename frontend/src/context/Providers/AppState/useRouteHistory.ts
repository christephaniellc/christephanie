import { useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import routes from '@/routes';

export const useRouteHistory = () => {
  const [navValue, setNavValue] = useState<number>(0);
  const location = useLocation();
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    setNavValue(
      Object.values(routes)
        .findIndex((route) => route.path === location.pathname)?.valueOf() || 0,
    );
  }, [location]);

  useEffect(() => {
    history.push(Object.values(routes)
      .findIndex((route) => route.path === location.pathname)?.valueOf() || 0);
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
  Invitation: '/invitation',
  Home: '/',
  Profile: '/profile',
} as const;