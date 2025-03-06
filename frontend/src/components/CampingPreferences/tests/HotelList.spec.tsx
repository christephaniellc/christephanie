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
  const mockSetTakingShuttle = jest.fn();
  const defaultHotels = [
    {
      name: 'Hotel 1',
      googleRating: 4.5,
      numberOfRatings: 100,
      hotelQuality: 3,
      onShuttleRoute: true,
      driveMinsFromWedding: 20,
      hotelBlock: false,
    },
    {
      name: 'Hotel 2',
      googleRating: 4.2,
      numberOfRatings: 200,
      hotelQuality: 2,
      onShuttleRoute: true,
      driveMinsFromWedding: 25,
      hotelBlock: true,
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the container with data-testid.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelList 
          hotelOptions={defaultHotels}
          expandedHotel={null}
          handleToggleHotelDetails={mockToggleHotelDetails}
          takingShuttle={true}
          setTakingShuttle={mockSetTakingShuttle}
        />
      </ThemeProvider>
    );

    expect(screen.getByTestId('hotel-options-container')).toBeInTheDocument();
  });

  it('should render a HotelOption component for each hotel.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelList 
          hotelOptions={defaultHotels}
          expandedHotel={null}
          handleToggleHotelDetails={mockToggleHotelDetails}
          takingShuttle={true}
          setTakingShuttle={mockSetTakingShuttle}
        />
      </ThemeProvider>
    );

    // There should be two HotelOption instances (one for each hotel)
    expect(screen.getAllByTestId('hotel-option')).toHaveLength(2);
    expect(HotelOption).toHaveBeenCalledTimes(2);
  });

  it('should pass the correct props to each HotelOption.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelList 
          hotelOptions={defaultHotels}
          expandedHotel={0}
          handleToggleHotelDetails={mockToggleHotelDetails}
          takingShuttle={true}
          setTakingShuttle={mockSetTakingShuttle}
        />
      </ThemeProvider>
    );

    // First call should receive the first hotel and be expanded
    expect(HotelOption).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        hotel: defaultHotels[0],
        index: 0,
        isExpanded: true,
        onToggle: expect.any(Function),
      }),
      expect.anything()
    );

    // Second call should receive the second hotel and not be expanded
    expect(HotelOption).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hotel: defaultHotels[1],
        index: 1,
        isExpanded: false,
        onToggle: expect.any(Function),
      }),
      expect.anything()
    );
  });

  it('should handle toggle correctly when the onToggle callback is called.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelList 
          hotelOptions={defaultHotels}
          expandedHotel={null}
          handleToggleHotelDetails={mockToggleHotelDetails}
          takingShuttle={true}
          setTakingShuttle={mockSetTakingShuttle}
        />
      </ThemeProvider>
    );

    // Extract the onToggle callback from the first HotelOption call
    const onToggleCallback = (HotelOption as jest.Mock).mock.calls[0][0].onToggle;
    
    // Call the callback
    onToggleCallback();
    
    // Check if the parent handler was called with the correct index
    expect(mockToggleHotelDetails).toHaveBeenCalledWith(0);
  });
});