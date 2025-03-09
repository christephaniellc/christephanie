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

// Import after mocking to avoid circular dependencies
import HotelOption from '../components/HotelOption';

const theme = createTheme();

describe('HotelOption Component.wip', () => {
  const defaultHotel = {
    name: 'Test Hotel',
    googleRating: 4.5,
    numberOfRatings: 100,
    hotelQuality: 3,
    onShuttleRoute: true,
    driveMinsFromWedding: 20,
    hotelBlock: false,
    image: undefined,
    phoneNumber: undefined,
    hotelRateAskFor: undefined
  };

  const mockToggle = jest.fn();

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <HotelOption
          hotel={defaultHotel}
          index={0}
          isExpanded={false}
          onToggle={mockToggle}
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
    expect(screen.getByTestId('hotel-button-0')).toBeInTheDocument();
  });

  it('should display hotel name', () => {
    renderComponent();
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
  });

  it('should show shuttle indicator for hotels on shuttle route', () => {
    renderComponent();
    expect(screen.getByText('Shuttle')).toBeInTheDocument();
  });

  it('should not show shuttle indicator for hotels not on shuttle route', () => {
    const hotelWithoutShuttle = {
      ...defaultHotel,
      onShuttleRoute: false,
    };
    renderComponent({ hotel: hotelWithoutShuttle });
    expect(screen.queryByText('Shuttle')).not.toBeInTheDocument();
  });

  it('should call onToggle when the button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('hotel-button-0'));
    expect(mockToggle).toHaveBeenCalled();
  });

  it('should show HotelDetail when expanded', () => {
    renderComponent({ isExpanded: true });
    expect(MockHotelDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        hotel: defaultHotel,
      }),
      expect.anything()
    );
  });

  it('should not show HotelDetail when collapsed', () => {
    renderComponent({ isExpanded: false });
    expect(MockHotelDetail).not.toHaveBeenCalled();
  });
});