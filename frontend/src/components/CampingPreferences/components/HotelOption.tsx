import React from 'react';
import { Button, Box, Typography, Chip, Collapse } from '@mui/material';
import { HotelOutlined, ExpandLess, ExpandMore, DirectionsBus, Star } from '@mui/icons-material';
import { HotelOptionProps } from '../types';
import HotelDetail from './HotelDetail';

const HotelOption: React.FC<HotelOptionProps> = ({ hotel, index, isExpanded, onToggle }) => {
  const [takingShuttle, setTakingShuttle] = React.useState(true);

  return (
    <>
      <Button
        fullWidth
        variant="text"
        color="secondary"
        onClick={onToggle}
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
        endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
        startIcon={<HotelOutlined />}
        data-testid={`hotel-button-${index}`}
      >
        <Box display="flex" alignItems="center" justifyContent="flex-start" width="1">
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
          {hotel.onShuttleRoute && (
            <Chip
              icon={<DirectionsBus sx={{ color: 'primary.contrastText', fontSize: '1rem' }} />}
              label="Shuttle"
              size="small"
              sx={{ ml: 1, backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 'bold' }}
            />
          )}
        </Box>
      </Button>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <HotelDetail 
          hotel={hotel} 
          takingShuttle={takingShuttle} 
          onToggleShuttle={() => setTakingShuttle(!takingShuttle)} 
        />
      </Collapse>
    </>
  );
};

export default HotelOption;