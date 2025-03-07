import React from 'react';
import { HotelDetailProps } from '../../types';

const HotelDetail: React.FC<HotelDetailProps> = ({ hotel, takingShuttle, onToggleShuttle }) => {
  return (
    <div data-testid="hotel-detail">
      {hotel.driveMinsFromWedding > 0 && (
        <div>Drive Time: {hotel.driveMinsFromWedding} mins</div>
      )}
      <button data-testid="search-google-button">Search on Google</button>
    </div>
  );
};

export default HotelDetail;