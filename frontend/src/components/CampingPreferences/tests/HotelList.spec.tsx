import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import HotelList from '../components/HotelList';
import HotelOption from '../components/HotelOption';

// Mock the HotelOption component
jest.mock('../components/HotelOption', () => {
  return jest.fn(() => <div data-testid="hotel-option">Mocked Hotel Option</div>);
});

const theme = createTheme();

describe('HotelList Component.wip', () => {
  const mockToggleHotelDetails = jest.fn();
  const defaultHotels = [
    {
      name: 'Hotel 1',
      googleRating: 4.5,
      numberOfRatings: 100,
      hotelQuality: 3,
      onShuttleRoute: true,
      driveMinsFromWedding: 20,
      hotelBlock: false,
      image: undefined,
      phoneNumber: undefined,
      hotelRateAskFor: undefined
    },
    {
      name: 'Hotel 2',
      googleRating: 4.0,
      numberOfRatings: 50,
      hotelQuality: 2,
      onShuttleRoute: false,
      driveMinsFromWedding: 30,
      hotelBlock: true,
      image: undefined,
      phoneNumber: undefined,
      hotelRateAskFor: undefined
    },
  ];

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <HotelList
          hotelOptions={defaultHotels}
          expandedHotel={null}
          handleToggleHotelDetails={mockToggleHotelDetails}
          {...props}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component', () => {
    renderComponent();
    expect(screen.getAllByTestId('hotel-option')).toHaveLength(2);
  });

  it('should pass the correct props to HotelOption', () => {
    renderComponent({ expandedHotel: 0 });
    expect(HotelOption).toHaveBeenCalledWith(
      expect.objectContaining({
        hotel: defaultHotels[0],
        index: 0,
        isExpanded: true,
      }),
      expect.anything()
    );
  });

  it('should handle expanded and collapsed hotel details', () => {
    renderComponent({ expandedHotel: 1 });
    expect(HotelOption).toHaveBeenCalledWith(
      expect.objectContaining({
        hotel: defaultHotels[0],
        index: 0,
        isExpanded: false,
      }),
      expect.anything()
    );
    expect(HotelOption).toHaveBeenCalledWith(
      expect.objectContaining({
        hotel: defaultHotels[1],
        index: 1,
        isExpanded: true,
      }),
      expect.anything()
    );
  });
});