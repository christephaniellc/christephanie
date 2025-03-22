import { useState } from 'react';
import { FamilyUnitDto } from '@/types/api';
import { CardSide, CardOrientation } from '../types/types';
import { CARD_WIDTH_INCHES, CARD_HEIGHT_INCHES } from './useCardDimensions';

export const usePrinting = () => {
  const [isPrinting, setIsPrinting] = useState(false);

  // Handle print button click
  const handlePrint = (
    selectedFamily: FamilyUnitDto | null, 
    cardSide: CardSide,
    orientation: CardOrientation
  ) => {
    if (!selectedFamily) return;
    
    setIsPrinting(true);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the card');
      setIsPrinting(false);
      return;
    }
    
    // Get the card element
    const cardElement = document.querySelector(
      `.card-${cardSide}-${orientation}`
    );
    
    if (!cardElement) {
      printWindow.close();
      setIsPrinting(false);
      return;
    }
    
    // Set page dimensions based on orientation
    const pageWidth = orientation === 'horizontal' ? CARD_WIDTH_INCHES : CARD_HEIGHT_INCHES;
    const pageHeight = orientation === 'horizontal' ? CARD_HEIGHT_INCHES : CARD_WIDTH_INCHES;
    
    // Set up the print window content
    printWindow.document.write(`
      <html>
        <head>
          <title>Print RSVP Card - ${selectedFamily?.unitName || 'Family'}</title>
          <style>
            @page {
              size: ${pageWidth}in ${pageHeight}in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: white;
            }
            .card-container {
              width: ${pageWidth}in;
              height: ${pageHeight}in;
              overflow: hidden;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .card-content {
              transform-origin: center;
              transform: scale(1);
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <div class="card-content">
              ${cardElement.outerHTML}
            </div>
          </div>
          <script>
            // Print and close after a short delay to ensure styles are applied
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Reset printing state after a short delay
    setTimeout(() => setIsPrinting(false), 1000);
  };

  return {
    isPrinting,
    handlePrint
  };
};