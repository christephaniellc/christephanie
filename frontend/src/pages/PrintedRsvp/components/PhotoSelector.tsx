import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Grid, 
  Box, 
  Paper,
  IconButton,
  Typography,
  useTheme,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { usePhotoVariants } from '../hooks/usePhotoVariants';
import { CardOrientation } from '../types/types';

interface PhotoSelectorProps {
  open: boolean;
  photoId: number;
  orientation: CardOrientation;
  onClose: () => void;
  onSelect: (photoSrc: string) => void;
}

const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  open,
  photoId,
  orientation,
  onClose,
  onSelect
}) => {
  const theme = useTheme();
  const { availablePhotos, currentPhotoGrid } = usePhotoVariants(orientation);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  // Find the current photo's source for highlighting
  const currentPhoto = currentPhotoGrid.find(item => item.id === photoId);
  const currentPhotoSrc = currentPhoto?.photoSrc || '';

  const handlePhotoSelect = (photoSrc: string, index: number) => {
    setSelectedPhotoIndex(index);
    onSelect(photoSrc);
  };

  const handleClose = () => {
    setSelectedPhotoIndex(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Typography variant="h6">
          Select a Photo
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click on a photo to replace the current one in your card layout.
        </Typography>
        
        <Grid container spacing={2}>
          {availablePhotos.map((photoSrc, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Tooltip title="Click to select this photo">
                <Paper
                  elevation={3}
                  onClick={() => handlePhotoSelect(photoSrc, index)}
                  sx={{
                    position: 'relative',
                    height: 160,
                    cursor: 'pointer',
                    borderRadius: 1,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    border: photoSrc === currentPhotoSrc ? `3px solid ${theme.palette.secondary.main}` : 'none',
                    transform: selectedPhotoIndex === index ? 'scale(0.96)' : 'scale(1)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={photoSrc}
                    alt={`Photo option ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                  
                  {photoSrc === currentPhotoSrc && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: theme.palette.secondary.main,
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </Box>
                  )}
                </Paper>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleClose} 
          variant="contained" 
          color="primary"
          disabled={selectedPhotoIndex === null}
        >
          Apply Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoSelector;