import { useState, useEffect, MutableRefObject } from 'react';

// Card dimensions in inches (standard 4x6 postcard size)
export const CARD_WIDTH_INCHES = 6.0;
export const CARD_HEIGHT_INCHES = 4.0;

interface CardDimensions {
  dimensions: { width: number; height: number };
  pixelsPerInch: number;
  cardScale: number;
  actualCardWidth: number;
  actualCardHeight: number;
  getInches: (pixels: number) => number;
  formatInches: (inches: number) => string;
}

export const useCardDimensions = (containerRef: MutableRefObject<HTMLDivElement | null>): CardDimensions => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pixelsPerInch, setPixelsPerInch] = useState(96); // Default PPI estimate
  const [cardScale, setCardScale] = useState(1.0);

  // Calculate dimensions and PPI on mount and window resize
  useEffect(() => {
    const calculateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        
        // Estimate PPI based on device pixel ratio and adjust for browser zoom
        const estimatedPPI = 96 * (window.devicePixelRatio || 1);
        setPixelsPerInch(estimatedPPI);
        
        // Calculate a scale factor to ensure card fits in the viewport
        const maxCardWidth = width * 0.7;
        const maxCardHeight = height * 0.7;
        
        const cardWidthPixels = CARD_WIDTH_INCHES * estimatedPPI;
        const cardHeightPixels = CARD_HEIGHT_INCHES * estimatedPPI;
        
        const scaleWidth = maxCardWidth / cardWidthPixels;
        const scaleHeight = maxCardHeight / cardHeightPixels;
        
        // Use the smaller scale to make sure card fits completely
        const newScale = Math.min(scaleWidth, scaleHeight, 1.0);
        setCardScale(newScale);
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    
    return () => {
      window.removeEventListener('resize', calculateDimensions);
    };
  }, [containerRef]);

  // Get inches from pixels
  const getInches = (pixels: number) => {
    return pixels / pixelsPerInch;
  };

  // Showing inches with two decimal points
  const formatInches = (inches: number) => {
    return `${inches.toFixed(2)}"`;
  };

  // Get actual card size in CSS pixels after scaling
  const actualCardWidth = CARD_WIDTH_INCHES * pixelsPerInch * cardScale;
  const actualCardHeight = CARD_HEIGHT_INCHES * pixelsPerInch * cardScale;
  
  return {
    dimensions,
    pixelsPerInch,
    cardScale,
    actualCardWidth,
    actualCardHeight,
    getInches,
    formatInches
  };
};