import { useState, useEffect } from 'react';
import { CardOrientation } from '../types/types';

// Card dimensions in inches (standard 4x6 postcard size)
export const CARD_WIDTH_INCHES = 7.0;
export const CARD_HEIGHT_INCHES = 5.0;

interface CardDimensions {
  cardWidth: number;
  cardHeight: number;
}

export const useCardDimensions = (orientation: CardOrientation): CardDimensions => {
  // Get fixed dimensions based on orientation - always in pixels directly
  // For horizontal: 7x5 inches @ 96ppi = 672x480 pixels
  // For vertical: 5x7 inches @ 96ppi = 480x672 pixels
  
  const cardWidth = orientation === 'horizontal' ? 672 : 480; // 7 inches or 5 inches @ 96dpi
  const cardHeight = orientation === 'horizontal' ? 480 : 672; // 5 inches or 7 inches @ 96dpi
  
  return {
    cardWidth,
    cardHeight
  };
};