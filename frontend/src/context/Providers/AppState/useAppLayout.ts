import React, { useEffect, useLayoutEffect, useState } from 'react';

export const useAppLayout = () => {
  const [screenWidth, setScreenWidth] = useState(0)
  const bottomNavHeight = 65;
  const [contentHeight, setContentHeight] = React.useState(0);


  useLayoutEffect(() => {
    const handleResize = () => {
      const minWidth = 475;
      const maxWidth = 1400;
      let screenWidth = window.innerWidth;
      let newHeightBasedOnZoom = window.innerHeight;
      if (screenWidth < minWidth) {
        const zoomLevel = screenWidth / minWidth;
        console.log('setting new zoomLevel', zoomLevel);
        newHeightBasedOnZoom = window.innerHeight / zoomLevel;
        document.body.style.zoom = `${zoomLevel}`;
      }
      if (screenWidth >= minWidth && screenWidth <= maxWidth) {
        document.body.style.zoom = `1`;
      }
      setScreenWidth(window.innerWidth);
      setContentHeight(newHeightBasedOnZoom - bottomNavHeight);
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