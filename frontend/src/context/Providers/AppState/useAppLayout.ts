import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTheme } from '@mui/system';

export const useAppLayout = () => {
  const theme = useTheme();
  const [screenWidth, setScreenWidth] = useState(0)
  const bottomNavHeight = 65;
  const versionRowHeight = 18;
  const [contentHeight, setContentHeight] = React.useState(0);
  const [contentPadding, setContentPadding] = React.useState(0);

  useLayoutEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const newHeightBasedOnZoom = window.innerHeight;
      // if (screenWidth < theme.breakpoints.values.md) {
      //   const zoomLevel = screenWidth / 500;
      //   console.log('setting new zoomLevel', zoomLevel);
      //   newHeightBasedOnZoom = window.innerHeight / zoomLevel;
      //   document.body.style.zoom = `${zoomLevel}`;
      // }
      // if (screenWidth >= theme.breakpoints.values.md && screenWidth <= theme.breakpoints.values.xl) {
      //   document.body.style.zoom = `1`;
      // }
      setScreenWidth(window.innerWidth);
      setContentHeight(newHeightBasedOnZoom - bottomNavHeight - versionRowHeight);
      
      // Set appropriate padding for content based on screen width
      let padding = 16; // Default padding
      if (window.innerWidth < 400) {
        padding = 8; // Smaller padding for very small screens
      } else if (window.innerWidth >= 1200) {
        padding = 24; // Larger padding for larger screens
      }
      setContentPadding(padding);
      //console.log('setting contentHeight', window.innerHeight - bottomNavHeight);
    };
    handleResize();

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {screenWidth, contentHeight, contentPadding};
}