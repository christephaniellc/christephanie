import { useEffect, useMemo, useState } from 'react';
import {useChristephanieTheme} from "../ThemeContext";
import { SxProps, useTheme } from '@mui/material';

export const useAppLayout = () => {
  const theme = useTheme();
  const [navValue, setNavValue] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return {navValue, setNavValue, screenWidth};
}