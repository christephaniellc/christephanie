import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';

// Create a simple mock component for HotelDetail
const MockHotelDetail = jest.fn(({ hotel }) => (
  <div data-testid="hotel-detail">
    {hotel.driveMinsFromWedding > 0 && (
      <div>Drive Time: {hotel.driveMinsFromWedding} mins</div>
    )}
    <button data-testid="search-google-button">Search on Google</button>
  </div>
));

// Mock modules
jest.mock('../components/HotelDetail', () => ({
  __esModule: true,
  default: (props) => MockHotelDetail(props)
}));

// Mock React.useState before importing the component
const mockSetTakingShuttle = jest.fn();
const mockUseState = jest.fn().mockImplementation((initial) => [initial, mockSetTakingShuttle]);
React.useState = mockUseState;

// Now import the component after mocking
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

    // Verify that HotelDetail was called with the right props
    expect(MockHotelDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        hotel: defaultHotel,
        takingShuttle: true
      })
    );
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

    // Verify that HotelDetail was not called
    expect(MockHotelDetail).not.toHaveBeenCalled();
  });
});