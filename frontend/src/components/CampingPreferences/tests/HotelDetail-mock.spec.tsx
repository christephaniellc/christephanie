import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';

// Define a fake RatingComponent to use in our tests
const MockRatingComponent = ({ score, numberOfRatings }) => (
  <div data-testid="rating-component">
    Rating: {score} ({numberOfRatings} reviews)
  </div>
);

// Define a fake test component mimicking HotelDetail's behavior
const TestHotelDetail = ({ hotel, takingShuttle, onToggleShuttle }) => {
  return (
    <div data-testid="hotel-detail">
      {hotel.googleRating > 0 && (
        <MockRatingComponent 
          score={hotel.googleRating} 
          numberOfRatings={hotel.numberOfRatings} 
        />
      )}
      
      {hotel.onShuttleRoute && (
        <div>Call & ask for {hotel.hotelBlock ? 'Stubler' : ''} wedding rate</div>
      )}
      
      <button 
        data-testid="shuttle-chip"
        className={takingShuttle ? 'MuiChip-filled' : 'MuiChip-outlined'}
        onClick={onToggleShuttle}
      >
        {hotel.onShuttleRoute ? 'Shuttle Available' : 'No Shuttle'}
      </button>
      
      {hotel.driveMinsFromWedding > 0 && (
        <div>Drive Time: {hotel.driveMinsFromWedding} mins</div>
      )}
      
      <button 
        data-testid="search-google-button"
        onClick={() => window.open(`https://www.google.com/search?q=${hotel.name}`)}
      >
        Search on Google
      </button>
    </div>
  );
};

const theme = createTheme();

describe('HotelDetail Component.wip', () => {
  const mockToggleShuttle = jest.fn();
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
    // Mock window.open
    window.open = jest.fn();
  });

  it('should render the rating component when googleRating is provided.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={defaultHotel} 
          takingShuttle={true}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    expect(screen.getByTestId('rating-component')).toBeInTheDocument();
  });

  it('should not render the rating component when googleRating is 0.wip', () => {
    const noRatingHotel = {
      ...defaultHotel,
      googleRating: 0,
    };

    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={noRatingHotel} 
          takingShuttle={true}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    expect(screen.queryByTestId('rating-component')).not.toBeInTheDocument();
  });

  it('should show wedding rate message when hotel is on shuttle route.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={defaultHotel} 
          takingShuttle={true}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    expect(screen.getByText(/Call & ask for/)).toBeInTheDocument();
  });

  it('should include hotel block name when hotelBlock is true.wip', () => {
    const blockHotel = {
      ...defaultHotel,
      hotelBlock: true,
    };

    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={blockHotel} 
          takingShuttle={true}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    expect(screen.getByText(/Call & ask for Stubler wedding rate/)).toBeInTheDocument();
  });

  it('should show filled shuttle chip when takingShuttle is true.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={defaultHotel} 
          takingShuttle={true}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    const chip = screen.getByTestId('shuttle-chip');
    expect(chip).toHaveClass('MuiChip-filled');
    expect(chip).not.toHaveClass('MuiChip-outlined');
  });

  it('should show outlined shuttle chip when takingShuttle is false.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={defaultHotel} 
          takingShuttle={false}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    const chip = screen.getByTestId('shuttle-chip');
    expect(chip).not.toHaveClass('MuiChip-filled');
    expect(chip).toHaveClass('MuiChip-outlined');
  });

  it('should call onToggleShuttle when shuttle chip is clicked.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={defaultHotel} 
          takingShuttle={true}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    const chip = screen.getByTestId('shuttle-chip');
    fireEvent.click(chip);

    expect(mockToggleShuttle).toHaveBeenCalledTimes(1);
  });

  it('should show drive time when driveMinsFromWedding is provided.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={defaultHotel} 
          takingShuttle={true}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Drive Time: 20 mins')).toBeInTheDocument();
  });

  it('should not show drive time when driveMinsFromWedding is 0.wip', () => {
    const noDriveTimeHotel = {
      ...defaultHotel,
      driveMinsFromWedding: 0,
    };

    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={noDriveTimeHotel} 
          takingShuttle={true}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    expect(screen.queryByText(/Drive Time:/)).not.toBeInTheDocument();
  });

  it('should open Google search when search button is clicked.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <TestHotelDetail 
          hotel={defaultHotel} 
          takingShuttle={true}
          onToggleShuttle={mockToggleShuttle}
        />
      </ThemeProvider>
    );

    const searchButton = screen.getByTestId('search-google-button');
    fireEvent.click(searchButton);

    expect(window.open).toHaveBeenCalledWith('https://www.google.com/search?q=Test Hotel');
  });
});