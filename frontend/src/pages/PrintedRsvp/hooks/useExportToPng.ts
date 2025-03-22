import { useState } from 'react';
import { FamilyUnitDto } from '@/types/api';
import { CardSide, CardOrientation } from '../types/types';
import html2canvas from 'html2canvas';

export const useExportToPng = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Handle PNG export button click
  const handleExportAsPng = async (
    selectedFamily: FamilyUnitDto | null,
    cardSide: CardSide,
    orientation: CardOrientation
  ) => {
    if (!selectedFamily) return;
    
    setIsExporting(true);
    
    try {
      // Get the card element
      const cardElement = document.querySelector(
        `.card-${cardSide}-${orientation}`
      ) as HTMLElement;
      
      if (!cardElement) {
        setIsExporting(false);
        return;
      }
      
      // Calculate dimensions for 300 DPI (4"x6" at 300dpi = 1200x1800 pixels)
      // This is a 3.125x scale from the 96dpi default (300/96)
      const scale = 3.125;
      
      // Set width and height based on orientation
      let width, height;
      
      if (orientation === 'horizontal') {
        // For horizontal: 6" x 4" at 300dpi
        width = 6 * 300;
        height = 4 * 300;
      } else {
        // For vertical: 4" x 6" at 300dpi
        width = 4 * 300;
        height = 6 * 300;
      }
      
      // Create a canvas with the dimensions and scale
      const canvas = await html2canvas(cardElement, {
        scale: scale,
        width: cardElement.offsetWidth,
        height: cardElement.offsetHeight,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      // Convert the canvas to a data URL and download
      const imgData = canvas.toDataURL('image/png');
      
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.download = `${selectedFamily.unitName || 'Family'}_${cardSide}_${orientation}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('There was an error exporting the card as PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExportAsPng
  };
};