import React, { useState, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Paper,
  Menu,
  MenuItem,
  Typography,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Popover,
  Stack,
  Grid
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import EditIcon from '@mui/icons-material/Edit';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CropIcon from '@mui/icons-material/Crop';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { usePhotoVariants } from '../hooks/usePhotoVariants';
import { PhotoGridItem, CardOrientation, PhotoVariant } from '../types/types';

interface PhotoGridProps {
  orientation: CardOrientation;
  editorOnly?: boolean;        // When true, hides layout options and just shows photos
  showControls?: boolean;      // When false, hides all control buttons
  interactivePreview?: boolean; // When true, makes photos clickable for editing
  layoutUpdatesPreview?: boolean; // When true, selecting a layout immediately updates the preview
  enableDragInteraction?: boolean; // When true, enables photo position dragging
  exportMode?: boolean;        // When true, optimizes for high-quality PNG export
  onPhotoClick?: (photoId: number) => void; // Callback for photo click in interactive mode
  onPhotoSelected?: (photoId: number) => void; // Callback when a photo is selected
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ 
  orientation,
  editorOnly = false, // When true, show only the photo grid without any layout options
  showControls = true,
  interactivePreview = false,
  layoutUpdatesPreview = false,
  enableDragInteraction = false,
  exportMode = false,
  onPhotoClick,
  onPhotoSelected
}) => {
  const { 
    currentPhotoGrid, 
    presetVariants, 
    randomizePhotos, 
    toggleLock, 
    setSelectedVariant,
    updatePhotoPosition,
    selectedVariantId
  } = usePhotoVariants(orientation);
  
  // State for photo editing
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [editAnchorEl, setEditAnchorEl] = useState<null | HTMLElement>(null);
  const [positionValue, setPositionValue] = useState<number>(50);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<string>('center 50%');
  
  // With Recoil state management, we don't need to force re-renders anymore
  // The state will be shared across all components using the hook
  
  // Handle photo edit menu open
  const handleEditOpen = (event: React.MouseEvent<HTMLElement> | null, photoId: number) => {
    if (event) {
      event.stopPropagation();
      setEditAnchorEl(event.currentTarget);
    } else {
      // When called directly without event (e.g. from preview mode)
      // Use a dummy anchor element or position the popover based on cursor
      const dummyAnchor = document.createElement('div');
      dummyAnchor.style.position = 'fixed';
      dummyAnchor.style.top = '50%';
      dummyAnchor.style.left = '50%';
      document.body.appendChild(dummyAnchor);
      setEditAnchorEl(dummyAnchor);
      
      // Clean up after popover closes
      const cleanup = () => {
        if (document.body.contains(dummyAnchor)) {
          document.body.removeChild(dummyAnchor);
        }
      };
      
      // Set timeout to cleanup after popover potentially closes
      setTimeout(cleanup, 500);
    }
    
    setEditingPhotoId(photoId);
    
    // Set initial position value based on current photo
    const photo = currentPhotoGrid.find(p => p.id === photoId);
    const currentPosition = photo?.objectPosition || 'center';
    
    // Parse position value if it's in the format "center X%"
    if (typeof currentPosition === 'string') {
      const match = currentPosition.match(/center\s+(\d+)%/);
      if (match && match[1]) {
        setPositionValue(parseInt(match[1]));
      } else {
        setPositionValue(50); // Default value
      }
    }
  };
  
  // Handle edit menu close
  const handleEditClose = () => {
    setEditAnchorEl(null);
    setEditingPhotoId(null);
  };
  
  // Handle position change with immediate update
  const handlePositionChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setPositionValue(value);
    
    // Apply the change immediately
    if (editingPhotoId !== null) {
      const newPosition = `center ${value}%`;
      updatePhotoPosition(editingPhotoId, newPosition);
    }
  };
  
  // Get grid template based on orientation
  const getGridTemplateString = () => {
    if (orientation === 'horizontal') {
      return {
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gridAutoFlow: 'dense'
      };
    } else {
      return {
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '2fr 1fr',
        gridAutoFlow: 'dense'
      };
    }
  };

  // Render a small thumbnail of a layout variant for the button
  const renderVariantThumbnail = (variant: PhotoVariant) => {
    return (
      <Box sx={{ 
        width: 60, 
        height: orientation === 'horizontal' ? 40 : 60,
        position: 'relative', 
        borderRadius: '4px', 
        overflow: 'hidden',
        backgroundColor: '#000',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <Box sx={{ 
          display: 'grid',
          ...getGridTemplateString(),
          gap: '1px',
          width: '100%',
          height: '100%',
          padding: '1px',
          boxSizing: 'border-box'
        }}>
          {variant.layout.map((item, index, array) => {
            // Check for duplicate IDs (merged cells)
            const isDuplicate = array.some((otherItem, otherIndex) => 
              otherItem.id === item.id && otherIndex < index
            );
            
            // Skip rendering duplicates
            if (isDuplicate) return null;
            
            // Find all items with the same ID to calculate span
            const sameIdItems = array.filter(i => i.id === item.id);
            const spanRows = new Set(sameIdItems.map(i => i.position[0])).size;
            const spanCols = new Set(sameIdItems.map(i => i.position[1])).size;
            
            return (
              <Box 
                key={`${item.id}-${item.position[0]}-${item.position[1]}`}
                sx={{ 
                  position: 'relative',
                  gridColumn: `${item.position[1]} / span ${spanCols}`,
                  gridRow: `${item.position[0]} / span ${spanRows}`,
                  background: `url(${item.photoSrc})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.7,
                  borderRadius: '2px'
                }}
              />
            );
          })}
        </Box>
      </Box>
    );
  };
  
  // Drag handlers for photo positioning
  const handleDragStart = (e: React.MouseEvent, photoId: number) => {
    if (!enableDragInteraction) return;

    e.preventDefault();
    setSelectedPhotoId(photoId);
    setIsDragging(true);
    setDragStartY(e.clientY);

    // Get current position of the photo
    const photo = currentPhotoGrid.find(p => p.id === photoId);
    if (photo) {
      const posStr = photo.objectPosition || 'center 50%';
      setCurrentPosition(posStr);
      
      // Extract the percentage value
      const match = posStr.match(/center\s+(\d+)%/);
      const currentPosValue = match ? parseInt(match[1]) : 50;
      setPositionValue(currentPosValue);
    }

    // Add global event listeners for drag and release
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || selectedPhotoId === null) return;

    // Calculate position change based on drag distance
    const dragDeltaY = e.clientY - dragStartY;
    const newPosition = Math.max(0, Math.min(100, positionValue - dragDeltaY * 0.2));
    setPositionValue(newPosition);

    // Apply position change immediately
    updatePhotoPosition(selectedPhotoId, `center ${newPosition}%`);
    setCurrentPosition(`center ${newPosition}%`);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Remove global event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  // Add cleanup for event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, selectedPhotoId]);

  // Handle direct click on photo in preview
  const handleDirectPhotoClick = (photoId: number) => {
    if (interactivePreview) {
      if (enableDragInteraction) {
        // In drag mode, select the photo rather than opening the dialog
        const newSelectedId = photoId === selectedPhotoId ? null : photoId;
        setSelectedPhotoId(newSelectedId);
        
        // Notify parent component if callback is provided
        if (onPhotoSelected) {
          onPhotoSelected(photoId);
        }
      } else {
        // If not in drag mode, open the edit dialog directly
        handleEditOpen(null, photoId);
      }
    } else if (onPhotoClick) {
      // Call provided callback if available
      onPhotoClick(photoId);
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {/* Layout presets buttons - shown in editor mode when showControls is true and not in export mode */}
      {showControls && !exportMode && (
        <Box sx={{ 
          mb: editorOnly ? 0 : 2, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1
        }}>
          {!editorOnly && (
            <Typography variant="subtitle2" sx={{ color: 'white', opacity: 0.9 }}>
              Layout Presets:
            </Typography>
          )}
          
          <Grid container spacing={1} sx={{ mt: 0.5 }}>
            {presetVariants.map((variant) => (
              <Grid item key={variant.id} xs={4} sm={4} md={4}>
                <Tooltip title={variant.name + (variant.description ? ` - ${variant.description}` : '')} placement="top">
                  <Paper
                    elevation={3}
                    onClick={() => {
                      // Apply the variant to both the editor and the interactive preview
                      setSelectedVariant(variant);
                      
                      // Add visual feedback
                      if (layoutUpdatesPreview) {
                        // Create feedback element
                        const element = document.createElement('div');
                        element.style.position = 'fixed';
                        element.style.top = '50%';
                        element.style.left = '50%';
                        element.style.transform = 'translate(-50%, -50%)';
                        element.style.padding = '10px 20px';
                        element.style.backgroundColor = 'rgba(25, 118, 210, 0.9)';
                        element.style.color = 'white';
                        element.style.borderRadius = '4px';
                        element.style.zIndex = '9999';
                        element.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                        element.textContent = 'Layout Applied!';
                        document.body.appendChild(element);
                        
                        // Remove after animation
                        setTimeout(() => {
                          element.style.opacity = '0';
                          element.style.transition = 'opacity 0.3s ease';
                          setTimeout(() => {
                            if (document.body.contains(element)) {
                              document.body.removeChild(element);
                            }
                          }, 300);
                        }, 800);
                      }
                    }}
                    sx={{ 
                      p: 0.5,
                      cursor: 'pointer',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      transition: 'all 0.2s',
                      border: variant.id === selectedVariantId
                        ? '2px solid #90caf9' 
                        : '2px solid transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {renderVariantThumbnail(variant)}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        textAlign: 'center', 
                        color: 'white',
                        fontSize: '0.65rem', 
                        mt: 0.5,
                        opacity: 0.8,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {variant.name}
                    </Typography>
                  </Paper>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
          
          {!editorOnly && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Tooltip title="Randomize photo arrangement">
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<ShuffleIcon />} 
                  onClick={randomizePhotos}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  Shuffle
                </Button>
              </Tooltip>
              
              <Typography variant="caption" sx={{ 
                alignSelf: 'center', 
                fontSize: '0.7rem', 
                color: 'rgba(255,255,255,0.7)'
              }}>
                Click photos to lock/edit
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      {/* Photo grid - not shown when editorOnly is true */}
      {!editorOnly && (
        <Box sx={{ 
          display: 'grid',
          ...getGridTemplateString(),
          gap: exportMode ? '0px' : '4px',
          width: '100%',
          height: '100%',
          padding: exportMode ? '0px' : '4px',
          boxSizing: 'border-box',
          flexGrow: 1
        }}>
          {currentPhotoGrid.map((item, index, array) => {
            // Check for merged cells - find items with same id (merged cells)
            const isDuplicate = array.some((otherItem, otherIndex) => 
              otherItem.id === item.id && otherIndex < index
            );
            
            // Skip rendering duplicate items
            if (isDuplicate) return null;
            
            // Find all items with the same id to calculate the span
            const sameIdItems = array.filter(i => i.id === item.id);
            const spanRows = new Set(sameIdItems.map(i => i.position[0])).size;
            const spanCols = new Set(sameIdItems.map(i => i.position[1])).size;

            // Calculate cell size based on identical IDs (for merged cells)
            return (
              <Box 
                key={`${item.id}-${item.position[0]}-${item.position[1]}`}
                component="div"
                sx={{ 
                  position: 'relative',
                  gridColumn: `${item.position[1]} / span ${spanCols}`,
                  gridRow: `${item.position[0]} / span ${spanRows}`,
                  overflow: 'hidden',
                  borderRadius: '4px'
                }}
              >
                <Box 
                  component="img" 
                  src={item.photoSrc}
                  alt={`Photo ${item.id}`} 
                  className={`photo-grid-image ${exportMode ? 'export-mode' : ''}`}
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: item.objectFit || 'cover',
                    objectPosition: item.objectPosition || 'center',
                    transition: exportMode ? 'none' : 'all 0.3s ease',
                    filter: exportMode 
                      ? 'none'  
                      : (interactivePreview 
                          ? (selectedPhotoId === item.id ? 'brightness(1.15)' : 'none') 
                          : (item.isLocked ? 'brightness(1.05)' : 'none')),
                    border: exportMode
                      ? 'none'
                      : (interactivePreview
                          ? (selectedPhotoId === item.id ? '2px solid rgba(25, 118, 210, 0.9)' : '2px solid transparent')
                          : (item.isLocked ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent')),
                    boxSizing: 'border-box',
                    cursor: exportMode ? 'default' : (enableDragInteraction && interactivePreview ? 'move' : 'pointer'),
                    '&:hover': {
                      filter: exportMode ? 'none' : 'brightness(1.1)',
                    }
                  }}
                  onMouseDown={enableDragInteraction && interactivePreview
                    ? (e) => handleDragStart(e, item.id)
                    : undefined
                  }
                  onClick={interactivePreview 
                    ? () => handleDirectPhotoClick(item.id)  // Direct edit in preview mode
                    : () => toggleLock(item.id)              // Toggle lock in editor mode
                  }
                />
                
                {/* Only show controls in non-interactive mode */}
                {!interactivePreview && (
                  <>
                    {/* Lock/unlock indicator overlay */}
                    {item.isLocked && (
                      <LockIcon 
                        fontSize="small" 
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'white',
                          filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.7))',
                          bgcolor: 'rgba(0,0,0,0.3)',
                          borderRadius: '50%',
                          padding: '2px'
                        }}
                      />
                    )}
                    
                    {/* Edit button overlay */}
                    {showControls && (
                      <Tooltip title="Edit photo position">
                        <IconButton
                          size="small"
                          className="edit-control"
                          onClick={(e) => handleEditOpen(e, item.id)}
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.7)'
                            },
                            width: 28,
                            height: 28
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
                
                {/* Special highlight for interactive mode */}
                {interactivePreview && (
                  <Box
                    data-interactive="true"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'transparent',
                      border: '2px dashed transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        border: '2px dashed rgba(255,255,255,0.5)',
                        backgroundColor: 'rgba(0,0,0,0.2)'
                      }
                    }}
                    onClick={() => handleDirectPhotoClick(item.id)}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}
      
      {/* Photo edit popover */}
      <Popover
        open={Boolean(editAnchorEl)}
        anchorEl={editAnchorEl}
        onClose={handleEditClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            p: 2,
            width: 250,
            backgroundColor: 'rgba(30,30,30,0.95)',
            borderRadius: '8px'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
          Adjust Photo Position
        </Typography>
        
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2 }}>
          Changes apply instantly as you adjust
        </Typography>
        
        <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 2 }}>
          <ArrowUpwardIcon sx={{ color: 'white', opacity: 0.7 }} />
          <Slider
            value={positionValue}
            onChange={handlePositionChange}
            aria-labelledby="position-slider"
            valueLabelDisplay="auto"
            step={5}
            marks
            min={0}
            max={100}
            sx={{ color: '#90caf9' }}
          />
          <ArrowDownwardIcon sx={{ color: 'white', opacity: 0.7 }} />
        </Stack>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleEditClose}
            fullWidth
            sx={{ bgcolor: '#90caf9', color: 'black' }}
          >
            Done
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};