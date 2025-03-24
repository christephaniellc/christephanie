import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Dialog, 
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Slide,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Zoom,
  Tooltip,
  Chip,
  Badge,
  Slider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ImageIcon from '@mui/icons-material/Image';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ReplayIcon from '@mui/icons-material/Replay';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InfoIcon from '@mui/icons-material/Info';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { TransitionProps } from '@mui/material/transitions';
import { FamilyUnitDto } from '@/types/api';
import { CardSide, CardOrientation } from '../types/types';
import { CardFrontHorizontal } from './card-variants/CardFrontHorizontal';
import { CardFrontVertical } from './card-variants/CardFrontVertical';
import { CardBackHorizontal } from './card-variants/CardBackHorizontal';
import { CardBackVertical } from './card-variants/CardBackVertical';
import { usePrinting, usePhotoVariants, useExportToPng } from '../hooks';
import { PhotoGrid } from './PhotoGrid';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import EmailIcon from '@mui/icons-material/Email';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CardModalProps {
  open: boolean;
  onClose: () => void;
  family: FamilyUnitDto | null;
  cardSide: CardSide;
  orientation: CardOrientation;
}

const CardModal: React.FC<CardModalProps> = ({
  open,
  onClose,
  family,
  cardSide: initialCardSide,
  orientation: initialOrientation
}) => {
  const { isPrinting, handlePrint } = usePrinting();
  const { isExporting, handleExportAsPng } = useExportToPng();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  
  // Local state to allow changing sides and orientation within modal
  const [cardSide, setCardSide] = useState<CardSide>(initialCardSide);
  const [orientation, setOrientation] = useState<CardOrientation>(initialOrientation);
  const [cardScale, setCardScale] = useState<number>(isSmall ? 1 : 1.8);
  const [helpDialogOpen, setHelpDialogOpen] = useState<boolean>(false);
  const [showChangeFeedback, setShowChangeFeedback] = useState<boolean>(false);
  
  // Handle card side toggle
  const handleCardSideToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newSide: CardSide | null
  ) => {
    if (newSide !== null) {
      setCardSide(newSide);
    }
  };
  
  // Toggle orientation
  const handleOrientationToggle = () => {
    setOrientation(prev => {
      const newOrientation = prev === 'horizontal' ? 'vertical' : 'horizontal';
      // Show feedback when orientation changes
      showTransitionFeedback();
      return newOrientation;
    });
  };
  
  // Show temporary feedback when changes are made
  const showTransitionFeedback = () => {
    setShowChangeFeedback(true);
    setTimeout(() => setShowChangeFeedback(false), 1500);
  };
  
  // Zoom controls
  const zoomIn = () => {
    setCardScale(prev => Math.min(prev + 0.2, isSmall ? 1.5 : 2.5));
  };
  
  const zoomOut = () => {
    setCardScale(prev => Math.max(prev - 0.2, 0.8));
  };

  // Reset zoom to default
  const resetZoom = () => {
    setCardScale(isSmall ? 1 : 1.8);
  };

  // Update default zoom when screen size changes
  useEffect(() => {
    setCardScale(isSmall ? 1 : 1.8);
  }, [isSmall]);

  // Get current photo variant for random button, getting the right state for the current orientation
  const { randomizePhotos, currentPhotoGrid } = usePhotoVariants(orientation);
  
  // State for selected photo in editor
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  
  // Handler to receive selected photo from PhotoGrid
  const handlePhotoSelected = (photoId: number) => {
    setSelectedPhotoId(prev => prev === photoId ? null : photoId);
  };
  
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(245, 245, 245, 0.95)',
          backdropFilter: 'blur(8px)'
        }
      }}
    >
      <AppBar 
        sx={{ 
          position: 'relative',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #1a237e, #3949ab)' 
            : 'linear-gradient(45deg, #3f51b5, #5c6bc0)'
        }}
        elevation={4}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography 
            sx={{ 
              ml: 2, 
              flex: 1,
              fontWeight: 500,
              color: 'white'
            }} 
            variant="h6" 
            component="div"
          >
            Save-the-Date Card: {family?.unitName || 'Family'}
          </Typography>
          
          {/* Card side toggle buttons */}
          <ToggleButtonGroup
            value={cardSide}
            exclusive
            onChange={handleCardSideToggle}
            aria-label="Card side"
            color="standard"
            size="small"
            sx={{ 
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: '24px',
              padding: '3px',
              '& .MuiToggleButton-root': {
                color: 'white',
                textTransform: 'none',
                px: 2,
                borderRadius: '20px',
                border: 'none',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }
            }}
          >
            <ToggleButton value="front">
              <MailOutlineIcon sx={{ mr: 1 }} />
              Address Side
            </ToggleButton>
            <ToggleButton value="back">
              <EmailIcon sx={{ mr: 1 }} />
              Photo Side
            </ToggleButton>
          </ToggleButtonGroup>

          {!isSmall && (
            <Button 
              color="inherit"
              variant={isExporting ? "outlined" : "contained"}
              onClick={() => family && handleExportAsPng(family, cardSide, orientation)}
              disabled={!family || isExporting}
              startIcon={<ImageIcon />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)'
                }
              }}
            >
              {isExporting ? "Exporting..." : "Export PNG (300 DPI)"}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main content area */}
      <Container 
        maxWidth={false}
        sx={{ 
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden'
        }}
      >
        {/* Feedback indicator for changes */}
        <Zoom in={showChangeFeedback} timeout={300}>
          <Chip 
            icon={<CheckCircleIcon />} 
            label={`Layout updated to ${orientation === 'horizontal' ? 'landscape' : 'portrait'}`} 
            color="success" 
            variant="filled"
            sx={{ 
              position: 'fixed', 
              top: 80, 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 9999,
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          />
        </Zoom>
        
        <Grid container spacing={3} sx={{ flexGrow: 1, height: '100%' }}>
          {/* Preview card container */}
          <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                Card Preview
              </Typography>
              
              {/* Zoom controls */}
              <Stack direction="row" spacing={1}>
                <Tooltip title="Zoom out">
                  <IconButton size="small" onClick={zoomOut}>
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Reset zoom">
                  <IconButton size="small" onClick={resetZoom}>
                    <Badge
                      badgeContent={Math.round(cardScale * 100) + '%'}
                      color="primary"
                      sx={{ '.MuiBadge-badge': { fontSize: '0.7rem', height: '16px', minWidth: '32px' } }}
                    >
                      <ZoomInIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Zoom in">
                  <IconButton size="small" onClick={zoomIn}>
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            
            <Paper 
              elevation={3}
              sx={{ 
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'auto',
                p: 3,
                mb: 2,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.9)' : 'rgba(245,245,245,0.9)',
                borderRadius: 2,
                position: 'relative'
              }}
            >
              <Box 
                sx={{ 
                  position: 'relative',
                  transform: `scale(${cardScale})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease-out, opacity 0.2s ease-in-out',
                  borderRadius: 1,
                  boxShadow: '0 5px 25px rgba(0,0,0,0.25)'
                }}
              >
                {/* Front sides */}
                {cardSide === 'front' && orientation === 'horizontal' && (
                  <CardFrontHorizontal selectedFamily={family} />
                )}
                {cardSide === 'front' && orientation === 'vertical' && (
                  <CardFrontVertical selectedFamily={family} />
                )}
                
                {/* Back sides - using editable components */}
                {cardSide === 'back' && orientation === 'horizontal' && (
                  <CardBackHorizontal />
                )}
                
                {cardSide === 'back' && orientation === 'vertical' && (
                  <CardBackVertical />
                )}
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Card dimensions: 6" × 4" ({orientation === 'horizontal' ? 'landscape' : 'portrait'})
              </Typography>
              
              <Tooltip title="Export as PNG at 300 DPI for high-quality printing">
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small" 
                  startIcon={<ImageIcon />}
                  onClick={() => family && handleExportAsPng(family, cardSide, orientation)}
                  disabled={!family || isExporting}
                >
                  Export PNG (300 DPI)
                </Button>
              </Tooltip>
            </Box>
          </Grid>

          {/* Controls and options */}
          {cardSide === 'back' && (
            <Grid item xs={12} md={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  Photo Editor
                </Typography>
                
                <Box>
                  <Tooltip title="Switch card orientation">
                    <Button 
                      variant="outlined" 
                      startIcon={<ScreenRotationIcon />} 
                      onClick={handleOrientationToggle}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      {orientation === 'horizontal' ? 'Portrait' : 'Landscape'}
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Help & Tips">
                    <IconButton size="small" onClick={() => setHelpDialogOpen(true)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Card sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                padding: 2
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 2
                }}>
                  {/* Layout selector title */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                    Layout Styles
                  </Typography>
                  
                  {/* Layout presets - just show the selection of thumbnail layouts */}
                  <Box>
                    <PhotoGrid 
                      orientation={orientation} 
                      showControls={true}
                      layoutUpdatesPreview={true} // Enable immediate updates to preview
                      onPhotoClick={() => {}} // No-op in editor mode
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  {/* Photo editing controls */}
                  {selectedPhotoId ? (
                    <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary }}>
                          Adjust Selected Photo
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="inherit" 
                          onClick={() => setSelectedPhotoId(null)}
                        >
                          Done
                        </Button>
                      </Box>
                      
                      {/* Photo position controls */}
                      <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.primary }}>
                        Photo Position:
                      </Typography>
                      <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 2 }}>
                        <ArrowUpwardIcon sx={{ color: 'text.secondary' }} />
                        <Slider
                          color="primary"
                          step={5}
                          marks
                          min={0}
                          max={100}
                          aria-label="Photo position"
                          valueLabelDisplay="auto"
                          valueLabelFormat={value => `${value}%`}
                          defaultValue={50}
                          onChange={(e, value) => {
                            if (selectedPhotoId) {
                              const newPosition = `center ${value}%`;
                              // Access updatePhotoPosition directly from hook instance
                              const { updatePhotoPosition } = usePhotoVariants(orientation);
                              updatePhotoPosition(selectedPhotoId, newPosition);
                            }
                          }}
                        />
                        <ArrowDownwardIcon sx={{ color: 'text.secondary' }} />
                      </Stack>
                      
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 2 }}>
                        Drag the photo up or down directly in the preview area to adjust
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={randomizePhotos}
                          startIcon={<ShuffleIcon />}
                          sx={{ flex: 1 }}
                        >
                          Shuffle Photos
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      {/* Random button when no photo is selected */}
                      <Box sx={{ mb: 2 }}>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={randomizePhotos}
                          startIcon={<ShuffleIcon />}
                          fullWidth
                        >
                          Randomize Photos
                        </Button>
                      </Box>
                    
                      {/* Instructions */}
                      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary }}>
                          Quick Tips:
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                          • Click a layout above to instantly apply it
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                          • Click any photo in the preview to select and adjust it
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          • Drag photos up/down to reposition them
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Card>
            </Grid>
          )}
          
          {cardSide === 'front' && (
            <Grid item xs={12} md={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  Address Layout Controls
                </Typography>
                
                <Tooltip title="Switch card orientation">
                  <Button 
                    variant="outlined" 
                    startIcon={<ScreenRotationIcon />} 
                    onClick={handleOrientationToggle}
                    size="small"
                  >
                    {orientation === 'horizontal' ? 'Portrait' : 'Landscape'}
                  </Button>
                </Tooltip>
              </Box>
              
              <Card sx={{ 
                flexGrow: 1, 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                boxShadow: theme.shadows[3]
              }}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                    {family?.unitName || 'Family'} Card
                  </Typography>
                  
                  <Box sx={{ 
                    width: '100%', 
                    maxWidth: 280, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2, 
                    alignItems: 'center'
                  }}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(0,0,0,0.05)', 
                        width: '100%',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="body1" gutterBottom>
                        <b>Address Side Details</b>
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Shows recipient address and your return address for mailing
                      </Typography>
                    </Paper>
                    
                    <Button 
                      variant="contained" 
                      startIcon={<EmailIcon />} 
                      onClick={() => setCardSide('back')}
                      size="large"
                      color="primary"
                      sx={{ width: '100%' }}
                    >
                      Switch to Photo Side
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          )}
        </Grid>
        
        {/* Help Dialog */}
        <Dialog 
          open={helpDialogOpen} 
          onClose={() => setHelpDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <AppBar position="static" color="primary" elevation={0}>
            <Toolbar variant="dense">
              <Typography variant="h6" sx={{ flexGrow: 1 }}>Help & Tips</Typography>
              <IconButton edge="end" color="inherit" onClick={() => setHelpDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Card Layout Options</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              You can customize your save-the-date card in several ways:
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>Orientation:</Typography>
            <Typography variant="body2" sx={{ mb: 2, pl: 2 }}>
              • Switch between landscape (horizontal) and portrait (vertical) formats<br />
              • Each orientation has different photo layouts available
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>Photos:</Typography>
            <Typography variant="body2" sx={{ mb: 2, pl: 2 }}>
              • Click any photo to lock/unlock it<br />
              • Locked photos won't change when randomizing<br />
              • Use the dropdown menu to browse preset layouts<br />
              • Use "Randomize Photos" to try different combinations
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>Printing:</Typography>
            <Typography variant="body2" sx={{ mb: 2, pl: 2 }}>
              • Cards are designed for standard 6×4 photo paper<br />
              • The "Print" button will open your browser's print dialog<br />
              • For best results, select "Actual Size" in print settings
            </Typography>
          </Box>
        </Dialog>
      </Container>
    </Dialog>
  );
};

export default CardModal;