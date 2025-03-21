import React, { useRef, useState } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Chip, 
  ToggleButtonGroup, 
  ToggleButton,
  Fade,
  Tooltip,
  IconButton,
  Button,
  LinearProgress
} from '@mui/material';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import isMobile from '@/utils/is-mobile';
import EmailIcon from '@mui/icons-material/Email';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { CardSide } from './types/types';
import { useCardDimensions, useFamilyData, usePrinting } from './hooks';
import { CardFrontSide, CardBackSide, FamilyList, RulerMarks, MobileView } from './components';

const PrintedRsvp: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardSide, setCardSide] = useState<CardSide>('front');

  // Hooks
  const { 
    actualCardWidth, 
    actualCardHeight, 
    cardScale, 
    pixelsPerInch 
  } = useCardDimensions(containerRef);
  
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
    calculateCompletionStatus,
    calculateCompletionPercentage,
    calculateLastNames,
    handleSortClick,
    handleSortClose,
    handleFamilySelect,
    handleSearchChange,
    handleRefresh,
    getAllFamiliesQuery
  } = useFamilyData();

  const { isPrinting, handlePrint } = usePrinting();

  // Handle card side toggle
  const handleCardSideToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newSide: CardSide | null
  ) => {
    if (newSide !== null) {
      setCardSide(newSide);
    }
  };
  
  // QR code URL for the selected family's invitation code
  const qrCodeUrl = selectedFamily?.invitationCode 
    ? `https://christephanie.com/rsvp?invitationCode=${selectedFamily.invitationCode}`
    : "https://christephanie.com/rsvp?invitationCode=DEMO";

  // Mobile view message
  if (isMobile && isSmallScreen) {
    return <MobileView />;
  }

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
      ref={containerRef}
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
          
          <Tooltip title="Print current card">
            <span>
              <IconButton 
                color="primary"
                onClick={() => handlePrint(selectedFamily, cardSide)}
                disabled={!selectedFamily || isPrinting}
              >
                <PrintIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Simplified info bar */}
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
          {/* Toggle between front and back of the card */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, gap: 2 }}>
            <ToggleButtonGroup
              value={cardSide}
              exclusive
              onChange={handleCardSideToggle}
              aria-label="Card side"
              color="primary"
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
            
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              disabled={!selectedFamily || isPrinting}
              onClick={() => handlePrint(selectedFamily, cardSide)}
              color="secondary"
              sx={{ ml: 2 }}
            >
              Print Card
            </Button>
          </Box>
          
          {/* Card with rulers */}
          <Box 
            sx={{ 
              position: 'relative', 
              flexGrow: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              p: 4,
              ml: 5, 
              mt: 5,
              overflow: 'auto',
              maxHeight: 'calc(100vh - 350px)'
            }}
          >
            {/* Horizontal ruler at the top */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 40, 
              width: `${actualCardWidth + 20}px`, 
              height: 40, 
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '4px 4px 0 0'
            }}>
              <RulerMarks size={actualCardWidth + 20} horizontal={true} pixelsPerInch={pixelsPerInch} />
            </Box>
            
            {/* Vertical ruler on the left */}
            <Box sx={{ 
              position: 'absolute', 
              top: 40, 
              left: 0, 
              width: 40, 
              height: `${actualCardHeight + 20}px`, 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '0 0 0 4px'
            }}>
              <RulerMarks size={actualCardHeight + 20} horizontal={false} pixelsPerInch={pixelsPerInch} />
            </Box>
            
            {/* Card content with fade transition */}
            <Box sx={{ mt: 4, ml: 4 }}>
              {selectedFamily ? (
                <Fade key={`${cardSide}-${selectedFamily.invitationCode}`} in={true} timeout={500}>
                  <Box>
                    {cardSide === 'front' ? (
                      <CardFrontSide 
                        actualCardWidth={actualCardWidth}
                        actualCardHeight={actualCardHeight}
                        cardScale={cardScale}
                        selectedFamily={selectedFamily}
                        calculateLastNames={calculateLastNames}
                        qrCodeUrl={qrCodeUrl}
                      />
                    ) : (
                      <CardBackSide 
                        actualCardWidth={actualCardWidth}
                        actualCardHeight={actualCardHeight}
                        cardScale={cardScale}
                      />
                    )}
                    
                    {/* Optional: Add a simple completion percentage */}
                    <Box sx={{ 
                      mt: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Form completion: {calculateCompletionPercentage(selectedFamily)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={calculateCompletionPercentage(selectedFamily)}
                        sx={{ 
                          width: 100,
                          height: 4,
                          borderRadius: 1
                        }}
                      />
                    </Box>
                  </Box>
                </Fade>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center', 
                  height: '200px',
                  width: `${actualCardWidth}px`,
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
              
              {/* Display physical dimensions below the card */}
              {selectedFamily && (
                <>
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'gray' }}>
                    Actual card dimensions: 6.0" × 4.0"
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'gray' }}>
                    Scale: {(cardScale * 100).toFixed(0)}% of actual size
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PrintedRsvp;