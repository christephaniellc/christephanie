import React from 'react';
import { Box, Typography, Chip, Tooltip, Button } from '@mui/material';
import { DirectionsBus, NoTransfer } from '@mui/icons-material';
import { HotelDetailProps } from '../types';
import RatingComponent from '@/components/RatingComponent/RatingComponent';

const HotelDetail: React.FC<HotelDetailProps> = ({ hotel, takingShuttle, onToggleShuttle }) => {
  return (
    <Box sx={{ p: 2 }} data-testid="hotel-detail">
      {hotel.googleRating > 0 && (
        <RatingComponent
          score={hotel.googleRating}
          numberOfRatings={hotel.numberOfRatings}
        />
      )}
      {hotel.onShuttleRoute && (
        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
          (Call & ask for {hotel.hotelBlock ? 'Stubler' : ''} wedding rate)
        </Typography>
      )}
      <Tooltip title={'Take our complimentary shuttle'}>
        <Chip
          id={`shuttle ${takingShuttle}`}
          sx={{
            width: '100%',
            mb: 1,
          }}
          onClick={onToggleShuttle}
          icon={
            hotel.onShuttleRoute ? (
              takingShuttle ? <DirectionsBus /> : <NoTransfer />
            ) : (
              <NoTransfer />
            )
          }
          variant={takingShuttle ? 'filled' : ('outlined' as 'filled' | 'outlined')}
          color={
            hotel.onShuttleRoute
              ? takingShuttle
                ? 'primary'
                : 'secondary'
              : ('error' as 'primary' | 'secondary' | 'error')
          }
          size="small"
          label={hotel.onShuttleRoute ? 'Shuttle Available' : 'No Shuttle'}
          data-testid="shuttle-chip"
        />
      </Tooltip>
      {hotel.driveMinsFromWedding > 0 && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Drive Time: {hotel.driveMinsFromWedding} mins
        </Typography>
      )}
      <Button
        variant="outlined"
        color="primary"
        size="small"
        fullWidth
        onClick={() => window.open(`https://www.google.com/search?q=${hotel.name}`)}
        sx={{ mt: 1 }}
        data-testid="search-google-button"
      >
        Search on Google
      </Button>
    </Box>
  );
};

export default HotelDetail;