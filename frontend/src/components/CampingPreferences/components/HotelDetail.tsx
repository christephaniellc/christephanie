import React from 'react';
import { Box, Typography, Chip, Tooltip, Button, Grid, Card, CardMedia, CardContent, Stack } from '@mui/material';
import { DirectionsBus, NoTransfer, OpenInNew } from '@mui/icons-material';
import { HotelDetailProps } from '../types';
import RatingComponent from '@/components/RatingComponent/RatingComponent';

// Import images directly
import brunswickHotel from '@/assets/holiday-inn-express-brunswick.jpg';
import charlestownHotel from '@/assets/holiday-inn-express-charlestown.jpg';

const HotelDetail: React.FC<HotelDetailProps> = ({ hotel }) => {
  const getImageSrc = (imagePath: string | undefined) => {
    if (!imagePath) return '';
    
    // Use the imported images based on the path
    if (imagePath.includes('brunswick')) {
      return brunswickHotel;
    } else if (imagePath.includes('charlestown')) {
      return charlestownHotel;
    }
    
    return imagePath;
  };

  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 2,
    }} data-testid="hotel-detail">
      {/* Hotel Image */}
      {hotel.image && (
        <CardMedia
          component="img"
          image={getImageSrc(hotel.image)}
          alt={hotel.name}
          sx={{ 
            height: 140, 
            objectFit: 'cover',
          }}
        />
      )}
      
      <CardContent sx={{ flex: 1, p: 2 }}>
        {/* Hotel name */}
        <Typography variant="h6" component="h2" gutterBottom>
          {hotel.name}
        </Typography>
        
        {/* Rating */}
        {hotel.googleRating > 0 && (
          <Box sx={{ mb: 2 }}>
            <RatingComponent
              score={hotel.googleRating}
              numberOfRatings={hotel.numberOfRatings}
            />
          </Box>
        )}
        
        <Stack spacing={1.5}>
          {/* Phone number */}
          {hotel.phoneNumber && (
            <Typography variant="body2">
              <strong>Phone:</strong> {hotel.phoneNumber}
            </Typography>
          )}
          
          {/* Rate info */}
          {hotel.hotelRateAskFor && (
            <Typography variant="body2" color="primary.light">
              <strong>Booking note:</strong> Ask for "{hotel.hotelRateAskFor}"
            </Typography>
          )}
          
          {/* Drive time */}
          {hotel.driveMinsFromWedding > 0 && (
            <Typography variant="body2">
              <strong>Drive time to venue:</strong> {hotel.driveMinsFromWedding} minutes
            </Typography>
          )}
          
          {/* Shuttle info */}
          {hotel.onShuttleRoute ? (
            <Chip
              icon={<DirectionsBus />}
              label="Shuttle Available"
              color="primary"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            />
          ) : (
            <Chip
              icon={<NoTransfer />}
              label="No Shuttle Service"
              color="error"
              variant="outlined"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            />
          )}
          
          {/* Google search button */}
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            endIcon={<OpenInNew />}
            onClick={() => window.open(`https://www.google.com/search?q=${hotel.name}`)}
            sx={{ mt: 1, alignSelf: 'flex-start' }}
            data-testid="search-google-button"
          >
            Search on Google
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default HotelDetail;