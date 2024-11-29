import {useLocation} from "react-router-dom";
import {useEffect, useRef} from "react";

export const useRouteHistory = () => {
  const location = useLocation();
  const history = useRef<string[]>([]);

  useEffect(() => {
    history.current.push(location.pathname);
  }, [location]);

  const getPreviousRoute = () => {
    if (history.current.length < 2) return null; // No previous route
    return history.current[history.current.length - 2];
  };

  return { history: history.current, getPreviousRoute };
};