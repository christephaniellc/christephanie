import {useLocation} from "react-router-dom";
import { useEffect, useMemo, useRef } from 'react';

export const useRouteHistory = () => {
  const location = useLocation();
  const history = useRef<string[]>([]);

  useEffect(() => {
    history.current.push(location.pathname);
  }, [location]);

  const previousRoute = useMemo(() => {
    if (history.current.length < 2) return null; // No previous route
    return history.current[history.current.length - 2];
  }, [history.current]);

  return { history, previousRoute };
};