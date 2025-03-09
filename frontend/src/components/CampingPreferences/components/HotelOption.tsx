import React from 'react';
import { Button, Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { HotelOutlined, OpenInNew, DirectionsBus, Star } from '@mui/icons-material';
import { HotelOptionProps } from '../types';
import HotelDetail from './HotelDetail';

const HotelOption: React.FC<HotelOptionProps> = ({ hotel, index, isExpanded, onToggle }) => {
  // Shuttle availability is now just an indicator, not a toggle
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);

  const handleOpenDetailsModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  return (
    <>
      <Button
        fullWidth
        variant="text"
        color="secondary"
        sx={{
          justifyContent: 'space-between',
          textAlign: 'left',
          py: 1,
          px: 2,
          borderRadius: 0,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,.05)',
          }
        }}
        endIcon={<OpenInNew onClick={handleOpenDetailsModal} />}
        startIcon={<HotelOutlined />}
        data-testid={`hotel-button-${index}`}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" width="1">
          <Box display="flex" alignItems="center">
            <Typography
              component="span"
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                textAlign: 'left',
                mr: 1,
              }}
            >
              {hotel.name}
            </Typography>
            {hotel.googleRating > 0 && (
              <Box display="flex" alignItems="center">
                <Star sx={{ color: 'secondary.main', fontSize: '1rem', mr: 0.3 }} />
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                  {hotel.googleRating}
                </Typography>
              </Box>
            )}
          </Box>
          
          {hotel.onShuttleRoute && (
            <Chip
              icon={<DirectionsBus sx={{ color: 'primary.contrastText', fontSize: '1rem' }} />}
              label="Shuttle"
              size="small"
              sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 'bold' }}
            />
          )}
        </Box>
      </Button>
      
      {/* Hotel Details Modal */}
      <Dialog
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {hotel.name}
        </DialogTitle>
        <DialogContent dividers>
          <HotelDetail 
            hotel={hotel}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HotelOption;