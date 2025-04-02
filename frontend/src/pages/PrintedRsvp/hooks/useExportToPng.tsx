import { useState, useCallback } from 'react';
import { FamilyUnitDto } from '@/types/api';
import { CardSide, CardOrientation } from '../types/types';
import html2canvas from 'html2canvas';

// Create a debounced function for download to avoid duplicate clicks
let exportInProgress = false;

/**
 * Hook for exporting card to high-quality 300 DPI PNG
 */
export const useExportToPng = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Handle PNG export button click
  const handleExportAsPng = useCallback(async (
    selectedFamily: FamilyUnitDto | null,
    cardSide: CardSide,
    orientation: CardOrientation
  ) => {
    if (!selectedFamily) {
      alert('Please select a family first');
      return;
    }
    
    // Prevent multiple simultaneous exports
    if (exportInProgress) {
      console.log('Export already in progress, please wait...');
      return;
    }
    
    exportInProgress = true;
    setIsExporting(true);
    console.log(`Starting PNG export for ${selectedFamily.unitName}, ${cardSide} side, ${orientation} orientation`);
    
    try {
      // Try to find the print-ready card element first (for modal)
      console.log(`Looking for card element with data-card-type="${cardSide}-${orientation}"`);
      let cardElement: HTMLElement | null = null;
      
      // First try: Look for the print-card-element with the right data-card-type
      const elements = document.querySelectorAll('[data-card-type]');
      console.log(`Found ${elements.length} elements with data-card-type`);
      
      for (const element of elements) {
        const type = element.getAttribute('data-card-type');
        console.log(`Element with data-card-type="${type}"`);
        if (type === `${cardSide}-${orientation}`) {
          cardElement = element as HTMLElement;
          console.log(`Found element with correct data-card-type="${type}"`);
          break;
        }
      }
      
      // If not found in modal, look for the card in the main page
      if (!cardElement) {
        console.log('Looking for card in main page view...');
        // Try the specific card class first
        const cardClassName = `.card-${cardSide}-${orientation}`;
        console.log(`Looking for element with class "${cardClassName}"`);
        cardElement = document.querySelector(cardClassName) as HTMLElement;
        
        // If we find it, make sure it's visible
        if (cardElement) {
          const style = window.getComputedStyle(cardElement);
          if (style.display === 'none' || cardElement.clientWidth === 0 || cardElement.clientHeight === 0) {
            console.log('Found card element but it is not visible');
            cardElement = null;
          } else {
            console.log(`Found visible card-${cardSide}-${orientation} element`);
          }
        }
      }
      
      // Try to find the print-ready-card class with the right content
      if (!cardElement) {
        console.log('Looking for element with print-ready-card class...');
        const printReadyCards = document.querySelectorAll('.print-ready-card');
        console.log(`Found ${printReadyCards.length} elements with print-ready-card class`);
        
        for (const card of printReadyCards) {
          // Look inside for the right card variant
          if (card.querySelector(`.card-${cardSide}-${orientation}`)) {
            console.log(`Found print-ready-card containing a ${cardSide}-${orientation} element`);
            cardElement = card as HTMLElement;
            break;
          }
          
          // Check if the container itself has the right class or data-attribute
          if (card.classList.contains(`card-${cardSide}-${orientation}`) || 
              card.getAttribute('data-card-type') === `${cardSide}-${orientation}`) {
            console.log(`Found print-ready-card with matching class or data-attribute`);
            cardElement = card as HTMLElement;
            break;
          }
        }
      }
      
      // Last resort: find by dimensions for elements without proper classes
      if (!cardElement) {
        console.log('Using last resort approach to find by dimensions...');
        const papers = document.querySelectorAll('.MuiPaper-root');
        console.log(`Found ${papers.length} paper elements`);
        
        for (const paper of papers) {
          // Check if visible
          const style = window.getComputedStyle(paper);
          if (style.display === 'none') continue;
          
          // Check dimensions
          const rect = paper.getBoundingClientRect();
          console.log(`Paper element dimensions: ${rect.width}x${rect.height}`);
          
          const expectedWidth = orientation === 'horizontal' ? 576 : 384; // 6" or 4" @ 96dpi
          const expectedHeight = orientation === 'horizontal' ? 384 : 576; // 4" or 6" @ 96dpi
          
          // Allow for more variations in size for the modal view
          const widthMatch = Math.abs(rect.width - expectedWidth) < 50;
          const heightMatch = Math.abs(rect.height - expectedHeight) < 50;
          
          if (widthMatch && heightMatch && rect.width > 0 && rect.height > 0) {
            console.log(`Found potential card element by dimensions: ${rect.width}x${rect.height}`);
            cardElement = paper as HTMLElement;
            break;
          }
        }
      }
      
      if (!cardElement) {
        console.error('Could not find the card element to export');
        alert('Could not find the card element to export. Please try again.');
        setIsExporting(false);
        return;
      }
      
      console.log(`Found card element: `, cardElement);
      
      // Calculate dimensions for 300 DPI (4"x6" at 300dpi = 1200x1800 pixels)
      // This is a 3.125x scale from the 96dpi default (300/96)
      // For 300 DPI output:
      // Portrait: 4"x6" = 1200x1800 pixels 
      // Landscape: 6"x4" = 1800x1200 pixels
      const scale = 4.0; // Increased for higher quality output
      
      // Create a function to handle the download - simplifying our logic
      const captureAndDownload = async (element: HTMLElement) => {
        console.log('Capturing element:', element);
        
        try {
          // Find the actual card element inside the container
          // If this is the modal container, look for the card component inside
          const cardPaper = element.querySelector('.card-front-vertical, .card-back-vertical, .card-front-horizontal, .card-back-horizontal') as HTMLElement || 
                          element.querySelector('.MuiPaper-root') as HTMLElement || 
                          element;
          
          console.log('Found card element for capture:', cardPaper);
          
          // Make a copy of the original element to avoid modifying the displayed one
          const elementClone = cardPaper.cloneNode(true) as HTMLElement;
          
          // Apply special styles for export
          elementClone.style.position = 'absolute';
          elementClone.style.top = '-9999px';
          elementClone.style.left = '-9999px';
          elementClone.style.transform = 'none'; // Remove any transforms
          elementClone.style.opacity = '1';
          
          // Keep boxShadow for all exports and force apply the address block shadow
          elementClone.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
          
          // For card fronts, we need to apply the address block shadow
          if (elementClone.classList.contains('card-front-vertical') || 
              elementClone.classList.contains('card-front-horizontal') ||
              elementClone.querySelector('.card-front-vertical, .card-front-horizontal')) {
            console.log('Processing card front, applying address block shadow');
            
            // FORCE APPLY SHADOWS: Directly create and insert a shadow element
            // This is a more drastic approach that ensures the shadow is visible
            const addressContainers = elementClone.querySelectorAll('div');
            for (const container of addressContainers) {
              const style = window.getComputedStyle(container);
              // Look for the address container by checking for common style patterns
              if ((style.border && style.border.includes('1px solid') && style.borderRadius === '4px') ||
                  (container.innerHTML.includes('Family') && style.position === 'relative')) {
                
                console.log('Found address container, applying shadow');
                
                // 1. Set inline style with !important to force the shadow
                (container as HTMLElement).style.cssText += '; box-shadow: 0 0 10px #9c27b0 !important;';
                
                // 2. Add a class that we can style with a strong selector
                container.classList.add('address-block-with-shadow');
                
                // 3. Create a style element with a very specific rule
                const styleElement = document.createElement('style');
                styleElement.textContent = `
                  .address-block-with-shadow {
                    box-shadow: 0 0 10px #9c27b0 !important;
                    -webkit-box-shadow: 0 0 10px #9c27b0 !important;
                    -moz-box-shadow: 0 0 10px #9c27b0 !important;
                  }
                `;
                elementClone.appendChild(styleElement);
                
                // 4. Create a pseudo-element to apply the shadow
                const shadowDiv = document.createElement('div');
                shadowDiv.style.cssText = `
                  position: absolute;
                  top: -5px;
                  left: -5px;
                  right: -5px;
                  bottom: -5px;
                  border-radius: 9px;
                  box-shadow: 0 0 15px 5px #9c27b0;
                  z-index: -1;
                  pointer-events: none;
                `;
                container.style.position = 'relative'; // Ensure relative positioning
                container.appendChild(shadowDiv);
                
                break;
              }
            }
            
            // Additional approach: Find elements that contain address text
            const allElements = elementClone.querySelectorAll('*');
            for (const el of allElements) {
              // Check if this element contains address-like text
              if (el.textContent && 
                  (el.textContent.includes('Family') || 
                   el.textContent.includes('Address') || 
                   el.textContent.match(/\d{5}/) // Zip code pattern
                  )) {
                // Go up two levels to find the container
                let container = el.parentElement?.parentElement;
                if (container) {
                  console.log('Found element with address text, applying shadow to container');
                  (container as HTMLElement).style.boxShadow = '0 0 10px #9c27b0';
                  (container as HTMLElement).style.position = 'relative';
                  (container as HTMLElement).style.zIndex = '5';
                }
              }
            }
          } else {
            console.log('Not a card front, not applying address shadow');
          }
          
          elementClone.style.margin = '0';
          
          // Don't remove border styling for card exports - keep gradient borders
          if (!elementClone.classList.contains('card-front-vertical') && 
              !elementClone.classList.contains('card-front-horizontal') &&
              !elementClone.classList.contains('card-back-vertical') &&
              !elementClone.classList.contains('card-back-horizontal')) {
            elementClone.style.border = 'none';
          }
          
          // Add a marker class to the body to indicate we're exporting
          document.body.classList.add('exporting-png');
          
          // Add to document temporarily
          document.body.appendChild(elementClone);
          
          // Mark card elements for special border handling
          if (elementClone.classList.contains('card-front-vertical') || 
              elementClone.classList.contains('card-front-horizontal') ||
              elementClone.classList.contains('card-back-vertical') ||
              elementClone.classList.contains('card-back-horizontal')) {
            elementClone.setAttribute('data-needs-gradient-border', 'true');
          }
          
          // Process images in the clone
          const images = elementClone.querySelectorAll('img');
          const imagePromises: Promise<void>[] = [];
          
          // Find corner elements and ensure they're visible
          const cornerElements = elementClone.querySelectorAll('[style*="border-top"][style*="border-right"]');
          cornerElements.forEach(corner => {
            (corner as HTMLElement).style.zIndex = '50'; // Very high z-index
          });
          
          // Special handling for El Pulpo icon - scale it properly for export
          const elPulpoIcons = elementClone.querySelectorAll('.el-pulpo-icon');
          elPulpoIcons.forEach(icon => {
            const img = icon as HTMLImageElement;
            
            // For export, preserve the icon dimensions from the component
            img.style.maxWidth = '65px';
            img.style.maxHeight = '65px';
            img.style.width = 'auto'; // Use auto width to maintain aspect ratio
            img.style.height = '100%'; // Use 100% height to fill the container
            img.style.objectFit = 'contain'; // Ensure the image keeps its aspect ratio
            img.style.objectPosition = 'center';
            img.style.opacity = '0.9';
            
            // Apply the same styling as in the component
            img.style.borderRadius = '50%';
            img.style.border = `2px solid rgba(255, 152, 0, 0.8)`;
            img.style.boxShadow = 'none';
            
            // Make sure the container is also properly constrained and positioned
            const container = img.closest('.el-pulpo-icon-container');
            if (container) {
              // Match the exact styles from CardFrontVertical.tsx
              (container as HTMLElement).style.display = 'flex';
              (container as HTMLElement).style.alignItems = 'center';
              (container as HTMLElement).style.paddingLeft = '8px';
              (container as HTMLElement).style.height = '65px';
              (container as HTMLElement).style.position = 'static'; // Use static positioning like in the component
              (container as HTMLElement).style.zIndex = '5';
              // Remove any top/right positioning that might cause issues
              (container as HTMLElement).style.top = '';
              (container as HTMLElement).style.right = '';
            }
          });
          
          // Fix image stretching issues and preserve aspect ratios for all images
          images.forEach(img => {
            img.crossOrigin = 'anonymous';
            
            // Skip El Pulpo icons as we've already handled them
            if (img.classList.contains('el-pulpo-icon')) {
              return;
            }
            
            // Make sure images maintain their aspect ratio
            img.style.objectFit = 'contain'; // 'contain' preserves aspect ratio
            
            // Add original image properties explicitly
            const originalObjectFit = img.getAttribute('data-original-object-fit') || 
                                     window.getComputedStyle(img).objectFit || 
                                     'cover';
            
            const originalObjectPosition = img.getAttribute('data-original-object-position') || 
                                         window.getComputedStyle(img).objectPosition || 
                                         'center';
            
            // Apply the original properties if they're set
            if (originalObjectFit && originalObjectFit !== 'none') {
              img.style.objectFit = originalObjectFit;
            }
            
            if (originalObjectPosition) {
              img.style.objectPosition = originalObjectPosition;
            }
            
            // Prevent image stretching by setting explicit dimensions
            if (img.parentElement) {
              img.style.maxWidth = '100%';
              img.style.maxHeight = '100%';
              img.style.width = 'auto';
              img.style.height = 'auto';
            }
            
            // Ensure images are fully loaded
            if (!img.complete) {
              const loadPromise = new Promise<void>(resolve => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              });
              imagePromises.push(loadPromise);
            }
          });
          
          // Wait for all images to load
          if (imagePromises.length > 0) {
            await Promise.all(imagePromises);
          }
          
          // Hide any controls or buttons
          const controls = elementClone.querySelectorAll('button, .MuiIconButton-root, [role="button"]');
          controls.forEach(control => {
            (control as HTMLElement).style.display = 'none';
          });
          
          // Apply special scaling for 300 DPI - recalculate dimensions to ensure correct output
          console.log(`Creating canvas for export at ${scale}x scale...`);
          
          // Create canvas with html2canvas
          console.log(`Creating canvas with scale: ${scale}`);
          
          // Calculate pixel dimensions based on orientation for high-resolution output
          const canvasTargetWidth = orientation === 'horizontal' ? 1800 : 1200; // 6"x300dpi or 4"x300dpi
          const canvasTargetHeight = orientation === 'horizontal' ? 1200 : 1800; // 4"x300dpi or 6"x300dpi
          
          // Log the target dimensions
          console.log(`Target dimensions: ${canvasTargetWidth}x${canvasTargetHeight} pixels at 300 DPI`);
          
          // Before creating the canvas, make one last attempt to ensure shadows are visible
          // We'll apply a filter to the card and a strong box-shadow that will definitely show up
          elementClone.style.filter = 'drop-shadow(0px 0px 0px transparent)'; // Reset any filters
          
          // Find the address block once more
          const addressBlocks = elementClone.querySelectorAll('[style*="border-radius"], [style*="border: 1px solid"]');
          addressBlocks.forEach(block => {
            if ((block as HTMLElement).style.backgroundColor?.includes('rgba(0,0,0,') ||
                (block as HTMLElement).style.border?.includes('solid')) {
              console.log('Final shadow application to address block');
              // Apply extremely strong shadow that html2canvas can't miss
              (block as HTMLElement).style.boxShadow = '0 0 20px 8px #9c27b0';
              (block as HTMLElement).style.webkitBoxShadow = '0 0 20px 8px #9c27b0';
              (block as HTMLElement).style.mozBoxShadow = '0 0 20px 8px #9c27b0';
            }
          });
          
          // Enhanced html2canvas configuration
          const canvas = await html2canvas(elementClone, {
            scale: scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: true,
            imageTimeout: 15000, // Increase timeout for image loading
            onclone: (doc) => {
              console.log('Clone created for html2canvas');
            },
            // Ensure all content is properly captured
            width: elementClone.offsetWidth,
            height: elementClone.offsetHeight,
            // These dimensions help with proper rendering
            windowWidth: 2000,
            windowHeight: 2000,
            // Most importantly, make sure to render shadows
            foreignObjectRendering: false,
            removeContainer: false,
            // Explicitly tell html2canvas to render shadows
            ignoreElements: (el) => false, // Don't ignore any elements
            onrendered: (canvas) => {
              console.log('Canvas rendered successfully');
            }
          });
          
          // Remove the clone from the document
          document.body.removeChild(elementClone);
          
          // Convert to data URL with maximum quality
          console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
          
          // Create a high-resolution output canvas with the exact dimensions we need
          // Use the same dimensions calculated earlier
          const finalWidth = canvasTargetWidth; // Use the values defined above
          const finalHeight = canvasTargetHeight;
          
          // Create a final canvas with exact target dimensions
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = finalWidth;
          finalCanvas.height = finalHeight;
          const ctx = finalCanvas.getContext('2d');
          
          if (ctx) {
            // Use high-quality image rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw with proper scaling, preserving aspect ratio
            const scaleFactor = Math.min(
              finalWidth / canvas.width,
              finalHeight / canvas.height
            );
            
            const scaledWidth = canvas.width * scaleFactor;
            const scaledHeight = canvas.height * scaleFactor;
            
            // Center the image on the canvas
            const offsetX = (finalWidth - scaledWidth) / 2;
            const offsetY = (finalHeight - scaledHeight) / 2;
            
            // Fill with white background first
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, finalWidth, finalHeight);
            
            // Draw the image centered and scaled
            ctx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);
            
            // Add gradient border if needed - check if this is a card that needs a border
            if (elementClone.hasAttribute('data-needs-gradient-border')) {
              console.log('Adding gradient border to the card');
              
              // Define the border width - adjust based on the scale
              const borderWidth = Math.round(60 * scaleFactor); // 10px scaled up
              
              // Define colors matching the theme
              const primaryColor = '#9c27b0';    // Purple - MUI primary
              const secondaryColor = '#ff9800';  // Orange - MUI secondary
              const darkColor = '#121212';       // Dark background
              
              // Save context state
              ctx.save();
              
              // Draw each side of the border with segments
              // We'll draw each border side as separate segments with the colors
              
              // Number of segments in the border (primary, dark, secondary pattern repeated)
              const segmentCount = 15;  // 5 full pattern repeats (3 colors each)
              
              // Calculate segment lengths for each side
              const topSegmentLength = scaledWidth / segmentCount;
              const sideSegmentLength = scaledHeight / segmentCount;
              
              // Draw top border segments
              for (let i = 0; i < segmentCount; i++) {
                const color = i % 3 === 0 ? primaryColor : i % 3 === 1 ? darkColor : secondaryColor;
                ctx.fillStyle = color;
                ctx.fillRect(
                  offsetX + (i * topSegmentLength), 
                  offsetY, 
                  topSegmentLength, 
                  borderWidth
                );
              }
              
              // Draw right border segments
              for (let i = 0; i < segmentCount; i++) {
                const color = i % 3 === 0 ? primaryColor : i % 3 === 1 ? darkColor : secondaryColor;
                ctx.fillStyle = color;
                ctx.fillRect(
                  offsetX + scaledWidth - borderWidth, 
                  offsetY + (i * sideSegmentLength), 
                  borderWidth, 
                  sideSegmentLength
                );
              }
              
              // Draw bottom border segments
              for (let i = 0; i < segmentCount; i++) {
                const color = i % 3 === 0 ? primaryColor : i % 3 === 1 ? darkColor : secondaryColor;
                ctx.fillStyle = color;
                ctx.fillRect(
                  offsetX + ((segmentCount - 1 - i) * topSegmentLength), 
                  offsetY + scaledHeight - borderWidth, 
                  topSegmentLength, 
                  borderWidth
                );
              }
              
              // Draw left border segments
              for (let i = 0; i < segmentCount; i++) {
                const color = i % 3 === 0 ? primaryColor : i % 3 === 1 ? darkColor : secondaryColor;
                ctx.fillStyle = color;
                ctx.fillRect(
                  offsetX, 
                  offsetY + ((segmentCount - 1 - i) * sideSegmentLength), 
                  borderWidth, 
                  sideSegmentLength
                );
              }
              
              // Restore context state
              ctx.restore();
            }
            
            console.log(`Final canvas dimensions: ${finalCanvas.width}x${finalCanvas.height}`);
          }
          
          // Convert to high-quality PNG
          const imgData = finalCanvas.toDataURL('image/png', 1.0);
          console.log('Canvas converted to data URL');
          
          // Create download link
          const filename = `${selectedFamily.unitName || 'Family'}_${cardSide}_${orientation}.png`;
          
          // Create a feedback element to show download is starting
          const feedback = document.createElement('div');
          feedback.textContent = `Preparing ${filename}...`;
          feedback.style.position = 'fixed';
          feedback.style.top = '50%';
          feedback.style.left = '50%';
          feedback.style.transform = 'translate(-50%, -50%)';
          feedback.style.padding = '15px 25px';
          feedback.style.backgroundColor = 'rgba(25, 118, 210, 0.9)';
          feedback.style.color = 'white';
          feedback.style.borderRadius = '4px';
          feedback.style.zIndex = '9999';
          feedback.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
          document.body.appendChild(feedback);
          
          // We'll create a direct download button that the user can see and click
          const downloadDirectly = () => {
            try {
              // Remove the feedback message
              if (document.body.contains(feedback)) {
                document.body.removeChild(feedback);
              }
              
              // Create a download button that is actually visible
              const downloadButton = document.createElement('button');
              downloadButton.textContent = 'Download PNG';
              downloadButton.style.position = 'fixed';
              downloadButton.style.top = '50%';
              downloadButton.style.left = '50%';
              downloadButton.style.transform = 'translate(-50%, -50%)';
              downloadButton.style.padding = '15px 25px';
              downloadButton.style.backgroundColor = '#4CAF50';
              downloadButton.style.color = 'white';
              downloadButton.style.border = 'none';
              downloadButton.style.borderRadius = '4px';
              downloadButton.style.cursor = 'pointer';
              downloadButton.style.fontSize = '16px';
              downloadButton.style.fontWeight = 'bold';
              downloadButton.style.zIndex = '9999';
              downloadButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              downloadButton.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Show the download is progressing
                downloadButton.textContent = 'Downloading...';
                downloadButton.style.backgroundColor = '#2E7D32';
                
                try {
                  // Open the image in a new window/tab, which should force the download dialog
                  const newWindow = window.open('');
                  if (newWindow) {
                    newWindow.document.write(`<img src="${imgData}" alt="${filename}" />`);
                    newWindow.document.title = filename;
                    // Add download instruction
                    newWindow.document.write('<div style="text-align:center; margin-top:20px; font-family:sans-serif;">Right-click on the image and select "Save Image As..." to download</div>');
                    newWindow.document.close();
                    
                    // Update the button text
                    downloadButton.textContent = 'Image opened in new tab';
                    
                    // Remove the button after a delay
                    setTimeout(() => {
                      if (document.body.contains(downloadButton)) {
                        document.body.removeChild(downloadButton);
                      }
                    }, 3000);
                  } else {
                    // If the window didn't open (pop-up blocker), try the download link approach
                    downloadButton.textContent = 'Pop-up blocked. Click again to download';
                    downloadButton.onclick = (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Create a temporary download link
                      const link = document.createElement('a');
                      link.href = imgData;
                      link.download = filename;
                      link.style.display = 'none';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      downloadButton.textContent = 'Download started!';
                      setTimeout(() => {
                        if (document.body.contains(downloadButton)) {
                          document.body.removeChild(downloadButton);
                        }
                      }, 2000);
                    };
                  }
                } catch (err) {
                  console.error('Error in window.open approach:', err);
                  downloadButton.textContent = 'Error. Click to try again';
                  downloadButton.style.backgroundColor = '#F44336';
                }
              };
              
              document.body.appendChild(downloadButton);
              
              // Add a fallback that shows up next to the button
              const helpText = document.createElement('div');
              helpText.textContent = "Can't download? Try right-clicking the button and 'Save link as'";
              helpText.style.position = 'fixed';
              helpText.style.top = 'calc(50% + 40px)';
              helpText.style.left = '50%';
              helpText.style.transform = 'translateX(-50%)';
              helpText.style.padding = '5px';
              helpText.style.fontSize = '12px';
              helpText.style.color = 'white';
              helpText.style.backgroundColor = 'rgba(0,0,0,0.7)';
              helpText.style.borderRadius = '4px';
              helpText.style.zIndex = '9999';
              document.body.appendChild(helpText);
              
              // Add a hidden download link to the button for right-click saving
              const hiddenLink = document.createElement('a');
              hiddenLink.href = imgData;
              hiddenLink.download = filename;
              hiddenLink.style.position = 'absolute';
              hiddenLink.style.top = '0';
              hiddenLink.style.left = '0';
              hiddenLink.style.width = '100%';
              hiddenLink.style.height = '100%';
              hiddenLink.style.opacity = '0';
              hiddenLink.style.cursor = 'pointer';
              downloadButton.appendChild(hiddenLink);
              
              // Clean up help text after a delay
              setTimeout(() => {
                if (document.body.contains(helpText)) {
                  document.body.removeChild(helpText);
                }
              }, 8000);
            } catch (err) {
              console.error('Error in direct download:', err);
              
              // Remove the feedback if it exists
              if (document.body.contains(feedback)) {
                document.body.removeChild(feedback);
              }
              
              // Create an error button
              const errorButton = document.createElement('button');
              errorButton.textContent = 'Download failed. Click to try again';
              errorButton.style.position = 'fixed';
              errorButton.style.top = '50%';
              errorButton.style.left = '50%';
              errorButton.style.transform = 'translate(-50%, -50%)';
              errorButton.style.padding = '15px 25px';
              errorButton.style.backgroundColor = '#F44336'; // Red for error
              errorButton.style.color = 'white';
              errorButton.style.border = 'none';
              errorButton.style.borderRadius = '4px';
              errorButton.style.cursor = 'pointer';
              errorButton.style.fontSize = '16px';
              errorButton.style.zIndex = '9999';
              errorButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              
              // On click, try the most direct download method
              errorButton.onclick = () => {
                // Create a direct download link
                const link = document.createElement('a');
                link.href = imgData;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Update button
                errorButton.textContent = 'Download retry initiated';
                errorButton.style.backgroundColor = '#FFA000'; // Orange for pending
                
                // Remove after a delay
                setTimeout(() => {
                  if (document.body.contains(errorButton)) {
                    document.body.removeChild(errorButton);
                  }
                }, 3000);
              };
              
              document.body.appendChild(errorButton);
              
              // Remove button after a delay
              setTimeout(() => {
                if (document.body.contains(errorButton)) {
                  document.body.removeChild(errorButton);
                }
              }, 10000);
            }
          };
          
          // Start download after a short delay
          setTimeout(downloadDirectly, 500);
          
          console.log('PNG export should be complete');
          return true;
        } catch (err) {
          console.error('Error in capture and download:', err);
          throw err;
        }
      };
      
      // Execute the capture and download
      await captureAndDownload(cardElement);
      
      console.log('PNG export successful!');
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert(`Error exporting PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      // Remove the export marker class
      document.body.classList.remove('exporting-png');
      // Release the lock after a short delay to prevent rapid clicks
      setTimeout(() => {
        exportInProgress = false;
      }, 500);
    }
  }, []);

  return {
    isExporting,
    handleExportAsPng
  };
};