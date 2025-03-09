import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTheme } from '@mui/system';

export const useAppLayout = () => {
  const theme = useTheme();
  const [screenWidth, setScreenWidth] = useState(0)
  const bottomNavHeight = 65;
  const versionRowHeight = 18;
  const [contentHeight, setContentHeight] = React.useState(0);

  useLayoutEffect(() => {
    const handleResize = () => {
      let screenWidth = window.innerWidth;
      let newHeightBasedOnZoom = window.innerHeight;
      if (screenWidth < theme.breakpoints.values.md) {
        const zoomLevel = screenWidth / 500;
        console.log('setting new zoomLevel', zoomLevel);
        newHeightBasedOnZoom = window.innerHeight / zoomLevel;
        document.body.style.zoom = `${zoomLevel}`;
      }
      if (screenWidth >= theme.breakpoints.values.md && screenWidth <= theme.breakpoints.values.xl) {
        document.body.style.zoom = `1`;
      }
      setScreenWidth(window.innerWidth);
      setContentHeight(newHeightBasedOnZoom - bottomNavHeight - versionRowHeight);
      //console.log('setting contentHeight', window.innerHeight - bottomNavHeight);
    };
    handleResize();

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {screenWidth, contentHeight};
}