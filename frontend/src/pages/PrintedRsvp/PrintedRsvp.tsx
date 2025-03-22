import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Chip, 
  ToggleButtonGroup, 
  ToggleButton,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import isMobile from '@/utils/is-mobile';
import EmailIcon from '@mui/icons-material/Email';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PrintIcon from '@mui/icons-material/Print';
import ImageIcon from '@mui/icons-material/Image';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { CardSide, CardOrientation } from './types/types';
import { useCardDimensions, useFamilyData, usePrinting, useExportToPng } from './hooks';
import { 
  CardFrontHorizontal, 
  CardFrontVertical,
  CardBackHorizontal,
  CardBackVertical,
  FamilyList, 
  MobileView,
  CardModal
} from './components';

const PrintedRsvp: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // Card state
  const [cardSide, setCardSide] = useState<CardSide>('front');
  const [frontOrientation, setFrontOrientation] = useState<CardOrientation>('horizontal');
  const [backOrientation, setBackOrientation] = useState<CardOrientation>('horizontal');
  const [modalOpen, setModalOpen] = useState(false);

  // Hooks
  const { cardWidth, cardHeight } = useCardDimensions(
    cardSide === 'front' ? frontOrientation : backOrientation
  );
  
  const { 
    filteredFamilies,
    allFamilies,
    selectedFamily,
    loading,
    error,
    searchQuery,
    sortOption,
    sortAnchorEl,
    familyStats,
    calculateCompletionPercentage,
    handleSortClick,
    handleSortClose,
    handleFamilySelect,
    handleSearchChange,
    handleRefresh,
    getAllFamiliesQuery
  } = useFamilyData();

  const { isPrinting, handlePrint } = usePrinting();
  const { isExporting, handleExportAsPng } = useExportToPng();

  // Handle card side toggle
  const handleCardSideToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newSide: CardSide | null
  ) => {
    if (newSide !== null) {
      setCardSide(newSide);
    }
  };
  
  // Handle orientation toggle
  const handleOrientationToggle = () => {
    if (cardSide === 'front') {
      setFrontOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
    } else {
      setBackOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
    }
  };
  
  // Handle card click to open modal
  const handleCardClick = () => {
    setModalOpen(true);
  };
  
  // Mobile view message
  if (isMobile && isSmallScreen) {
    return <MobileView />;
  }

  // Get current orientation based on current side
  const currentOrientation = cardSide === 'front' ? frontOrientation : backOrientation;
  
  // Main view
  return (
    <Box 
      sx={{ 
        p: 4, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <StephsActualFavoriteTypography variant="h3" sx={{ flexGrow: 1 }}>
          Printed RSVP Card Preview
        </StephsActualFavoriteTypography>
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton 
              color="primary"
              onClick={handleRefresh}
              disabled={getAllFamiliesQuery.isFetching}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export as PNG (300 DPI)">
            <span>
              <IconButton 
                color="primary"
                onClick={() => handleExportAsPng(selectedFamily, cardSide, currentOrientation)}
                disabled={!selectedFamily || isExporting}
              >
                <ImageIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Info bar */}
      <Box 
        sx={{ 
          mb: 2, 
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            icon={<FavoriteIcon />} 
            label={`${familyStats.interestedGuests} Interested`} 
            color="success"
            variant="outlined"
            size="small"
          />
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            Showing {filteredFamilies.length} of {familyStats.totalFamilies} families
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            Card size: 6.0" × 4.0"
          </Typography>
        </Box>
      </Box>
      
      {/* Main content area with families list on left and card preview on right */}
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 3, height: `calc(100vh - 350px)` }}>
        {/* Left side - Families List */}
        <FamilyList 
          familyStats={familyStats}
          filteredFamilies={filteredFamilies}
          allFamilies={allFamilies}
          searchQuery={searchQuery}
          sortOption={sortOption}
          sortAnchorEl={sortAnchorEl}
          selectedFamily={selectedFamily}
          loading={loading}
          error={error}
          handleSearchChange={handleSearchChange}
          handleSortClick={handleSortClick}
          handleSortClose={handleSortClose}
          handleFamilySelect={handleFamilySelect}
          handleRefresh={handleRefresh}
          calculateCompletionPercentage={calculateCompletionPercentage}
          isFetching={getAllFamiliesQuery.isFetching}
        />
        
        {/* Right side - Card Preview */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Toggle controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {/* Side toggle */}
            <ToggleButtonGroup
              value={cardSide}
              exclusive
              onChange={handleCardSideToggle}
              aria-label="Card side"
              color="primary"
              size="small"
            >
              <ToggleButton value="front">
                <MailOutlineIcon sx={{ mr: 1 }} />
                Address Side
              </ToggleButton>
              <ToggleButton value="back">
                <EmailIcon sx={{ mr: 1 }} />
                Picture Side
              </ToggleButton>
            </ToggleButtonGroup>
            
            {/* Orientation and action buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={`Switch to ${currentOrientation === 'horizontal' ? 'vertical' : 'horizontal'} orientation`}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ScreenRotationIcon />}
                  onClick={handleOrientationToggle}
                >
                  {currentOrientation === 'horizontal' ? 'Landscape' : 'Portrait'}
                </Button>
              </Tooltip>
              
              <Tooltip title="Open in full screen">
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInFullIcon />}
                    onClick={handleCardClick}
                    disabled={!selectedFamily}
                  >
                    Expand
                  </Button>
                </span>
              </Tooltip>
              
              <Button
                variant="contained"
                size="small"
                startIcon={<ImageIcon />}
                disabled={!selectedFamily || isExporting}
                onClick={() => handleExportAsPng(selectedFamily, cardSide, currentOrientation)}
                color="secondary"
              >
                Export PNG (300 DPI)
              </Button>
            </Box>
          </Box>
          
          {/* Card preview */}
          <Box 
            sx={{ 
              position: 'relative', 
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 350px)',
              cursor: selectedFamily ? 'pointer' : 'default'
            }}
            onClick={selectedFamily ? handleCardClick : undefined}
          >
            {selectedFamily ? (
              <Box>
                {cardSide === 'front' && frontOrientation === 'horizontal' && (
                  <CardFrontHorizontal selectedFamily={selectedFamily} />
                )}
                {cardSide === 'front' && frontOrientation === 'vertical' && (
                  <CardFrontVertical selectedFamily={selectedFamily} />
                )}
                {cardSide === 'back' && backOrientation === 'horizontal' && (
                  <CardBackHorizontal previewOnly={true} />
                )}
                {cardSide === 'back' && backOrientation === 'vertical' && (
                  <CardBackVertical previewOnly={true} />
                )}
                
                {/* Caption */}
                <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'gray' }}>
                  Click card to enlarge • {cardSide === 'front' ? 'Address' : 'Picture'} side • {currentOrientation === 'horizontal' ? 'Landscape' : 'Portrait'} orientation
                </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center', 
                height: '200px',
                width: '400px',
                color: 'text.secondary',
                bgcolor: 'rgba(0,0,0,0.3)',
                borderRadius: 2,
                p: 3
              }}>
                <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography gutterBottom>Select a family to preview their card</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Choose a family from the list on the left to see their RSVP card
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Modal for enlarged card view */}
      <CardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        family={selectedFamily}
        cardSide={cardSide}
        orientation={currentOrientation}
      />
    </Box>
  );
};

export default PrintedRsvp;