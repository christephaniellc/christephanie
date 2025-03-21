import { useState } from 'react';
import { FamilyUnitDto } from '@/types/api';
import { CardSide } from '../types/types';
import { CARD_WIDTH_INCHES, CARD_HEIGHT_INCHES } from './useCardDimensions';

export const usePrinting = () => {
  const [isPrinting, setIsPrinting] = useState(false);

  // Handle print button click
  const handlePrint = (selectedFamily: FamilyUnitDto | null, cardSide: CardSide) => {
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
      cardSide === 'front' ? '.front-card' : '.back-card'
    );
    
    if (!cardElement) {
      printWindow.close();
      setIsPrinting(false);
      return;
    }
    
    // Set up the print window content
    printWindow.document.write(`
      <html>
        <head>
          <title>Print RSVP Card - ${selectedFamily?.unitName || 'Family'}</title>
          <style>
            @page {
              size: ${CARD_WIDTH_INCHES}in ${CARD_HEIGHT_INCHES}in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: white;
            }
            .card-container {
              width: ${CARD_WIDTH_INCHES}in;
              height: ${CARD_HEIGHT_INCHES}in;
              overflow: hidden;
            }
            .card-content {
              transform-origin: top left;
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