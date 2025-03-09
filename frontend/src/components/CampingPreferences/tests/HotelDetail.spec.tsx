import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import HotelDetail from '../components/HotelDetail';

// Mock RatingComponent since it's a dependency
jest.mock('@/components/RatingComponent/RatingComponent', () => {
  return {
    __esModule: true,
    default: ({ score, numberOfRatings }: { score: number; numberOfRatings: number }) => (
      <div data-testid="rating-component">
        Rating: {score} ({numberOfRatings} reviews)
      </div>
    ),
  };
});

const theme = createTheme();

describe('HotelDetail Component.wip', () => {
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

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <HotelDetail
          hotel={defaultHotel}
          {...props}
        />
      </ThemeProvider>
    );
  };

  it('should render the component', () => {
    renderComponent();
    expect(screen.getByTestId('hotel-detail')).toBeInTheDocument();
  });

  it('should display drive time when driveMinsFromWedding is provided', () => {
    renderComponent();
    expect(screen.getByText(/Drive time to venue:/i)).toBeInTheDocument();
  });

  it('should display rating when googleRating is provided', () => {
    renderComponent();
    expect(screen.getByTestId('rating-component')).toBeInTheDocument();
  });

  it('should open Google search when button is clicked', () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    renderComponent();
    
    const searchButton = screen.getByTestId('search-google-button');
    fireEvent.click(searchButton);
    
    expect(windowOpenSpy).toHaveBeenCalledWith(expect.stringContaining('Test Hotel'));
    
    windowOpenSpy.mockRestore();
  });

  it('should display shuttle info for hotels on shuttle route', () => {
    renderComponent();
    expect(screen.getByText(/Shuttle Available/i)).toBeInTheDocument();
  });

  it('should display no shuttle info for hotels not on shuttle route', () => {
    const hotelWithoutShuttle = {
      ...defaultHotel,
      onShuttleRoute: false,
    };
    
    renderComponent({ hotel: hotelWithoutShuttle });
    expect(screen.getByText(/No Shuttle/i)).toBeInTheDocument();
  });

  it('should display phone number when provided', () => {
    const hotelWithPhone = {
      ...defaultHotel,
      phoneNumber: '123-456-7890',
    };
    
    renderComponent({ hotel: hotelWithPhone });
    expect(screen.getByText(/123-456-7890/i)).toBeInTheDocument();
  });

  it('should display hotel rate info when provided', () => {
    const hotelWithRate = {
      ...defaultHotel,
      hotelRateAskFor: 'special rate',
    };
    
    renderComponent({ hotel: hotelWithRate });
    expect(screen.getByText(/special rate/i)).toBeInTheDocument();
  });
});