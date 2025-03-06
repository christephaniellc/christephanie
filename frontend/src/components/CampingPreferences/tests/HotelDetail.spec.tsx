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
        <HotelDetail 
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
        <HotelDetail 
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
        <HotelDetail 
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
        <HotelDetail 
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
        <HotelDetail 
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
        <HotelDetail 
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
        <HotelDetail 
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
        <HotelDetail 
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
        <HotelDetail 
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
        <HotelDetail 
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