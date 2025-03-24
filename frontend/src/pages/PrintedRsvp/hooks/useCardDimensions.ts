import { useState, useEffect } from 'react';
import { CardOrientation } from '../types/types';

// Card dimensions in inches (standard 4x6 postcard size)
export const CARD_WIDTH_INCHES = 6.0;
export const CARD_HEIGHT_INCHES = 4.0;

interface CardDimensions {
  cardWidth: number;
  cardHeight: number;
}

export const useCardDimensions = (orientation: CardOrientation): CardDimensions => {
  // Get fixed dimensions based on orientation - always in pixels directly
  // For horizontal: 6x4 inches @ 96ppi = 576x384 pixels
  // For vertical: 4x6 inches @ 96ppi = 384x576 pixels
  
  const cardWidth = orientation === 'horizontal' ? 576 : 384; // 6 inches or 4 inches @ 96ppi
  const cardHeight = orientation === 'horizontal' ? 384 : 576; // 4 inches or 6 inches @ 96ppi
  
  return {
    cardWidth,
    cardHeight
  };
};