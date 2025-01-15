import React, { useEffect, useState } from 'react';

export const useAppLayout = () => {
  const [screenWidth, setScreenWidth] = useState(0)
  const bottomNavHeight = 56;
  const [contentHeight, setContentHeight] = React.useState(0);


  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setContentHeight(window.innerHeight - bottomNavHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return {screenWidth, contentHeight};
}