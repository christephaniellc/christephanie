import { darken, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

export const useBoxShadow = () => {
  const theme = useTheme();
  const mousePosition = React.useRef({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const boxShadow = useMemo(() => {
    const { x, y } = mousePosition.current;
    const shadowX = (x / window.innerWidth) * 10 + 5;
    const shadowY = (y / window.innerHeight) * 10 + 5;
    return `${shadowX}px ${shadowY}px 0px ${darken(theme.palette.primary.dark, 0.85)}`;
  }, [mousePosition.current, theme.palette.primary.dark]);

  return { boxShadow, mousePosition, handleMouseMove };
};
