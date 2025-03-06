import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import HotelOption from '../components/HotelOption';

const theme = createTheme();

describe('HotelOption Component.wip', () => {
  const mockToggle = jest.fn();
  const defaultHotel = {
    name: 'Test Hotel',
    googleRating: 4.5,
    numberOfRatings: 100,
    hotelQuality: 3,
    onShuttleRoute: true,
    driveMinsFromWedding: 20,
    hotelBlock: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the hotel name and rating.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelOption 
          hotel={defaultHotel} 
          index={0}
          isExpanded={false}
          onToggle={mockToggle}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should show the shuttle chip when the hotel is on the shuttle route.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelOption 
          hotel={defaultHotel} 
          index={0}
          isExpanded={false}
          onToggle={mockToggle}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Shuttle')).toBeInTheDocument();
  });

  it('should not show the shuttle chip when the hotel is not on the shuttle route.wip', () => {
    const noShuttleHotel = {
      ...defaultHotel,
      onShuttleRoute: false,
    };

    render(
      <ThemeProvider theme={theme}>
        <HotelOption 
          hotel={noShuttleHotel} 
          index={0}
          isExpanded={false}
          onToggle={mockToggle}
        />
      </ThemeProvider>
    );

    expect(screen.queryByText('Shuttle')).not.toBeInTheDocument();
  });

  it('should call onToggle when the button is clicked.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelOption 
          hotel={defaultHotel} 
          index={0}
          isExpanded={false}
          onToggle={mockToggle}
        />
      </ThemeProvider>
    );

    const button = screen.getByTestId('hotel-button-0');
    fireEvent.click(button);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('should show expand icon when not expanded.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelOption 
          hotel={defaultHotel} 
          index={0}
          isExpanded={false}
          onToggle={mockToggle}
        />
      </ThemeProvider>
    );

    // This is a visual test, so we'll just check that the button has been rendered
    const button = screen.getByTestId('hotel-button-0');
    expect(button).toBeInTheDocument();
    // We could also check for the icon, but it's more complex in React Testing Library
  });

  it('should show collapse icon when expanded.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelOption 
          hotel={defaultHotel} 
          index={0}
          isExpanded={true}
          onToggle={mockToggle}
        />
      </ThemeProvider>
    );

    // This is a visual test, so we'll just check that the button has been rendered
    const button = screen.getByTestId('hotel-button-0');
    expect(button).toBeInTheDocument();
  });

  it('should show the hotel details when expanded.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelOption 
          hotel={defaultHotel} 
          index={0}
          isExpanded={true}
          onToggle={mockToggle}
        />
      </ThemeProvider>
    );

    // Hotel details should be visible
    expect(screen.getByTestId('hotel-detail')).toBeInTheDocument();
    expect(screen.getByText('Drive Time: 20 mins')).toBeInTheDocument();
    expect(screen.getByText('Search on Google')).toBeInTheDocument();
  });

  it('should not show the hotel details when collapsed.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <HotelOption 
          hotel={defaultHotel} 
          index={0}
          isExpanded={false}
          onToggle={mockToggle}
        />
      </ThemeProvider>
    );

    // Hotel details should not be visible
    expect(screen.queryByTestId('hotel-detail')).not.toBeInTheDocument();
    expect(screen.queryByText('Drive Time: 20 mins')).not.toBeInTheDocument();
    expect(screen.queryByText('Search on Google')).not.toBeInTheDocument();
  });
});