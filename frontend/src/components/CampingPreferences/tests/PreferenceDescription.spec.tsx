import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import PreferenceDescription from '../components/PreferenceDescription';
import { SleepPreferenceEnum } from '@/types/api';

// Mock dependencies
jest.mock('../components/HotelList', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="hotel-list-component">Hotel List Component</div>,
  };
});

const theme = createTheme();

describe('PreferenceDescription Component.wip', () => {
  const mockToggleHotelDetails = jest.fn();
  const mockSetTakingShuttle = jest.fn();
  const defaultProps = {
    campingValue: SleepPreferenceEnum.Unknown,
    hotelOptions: [],
    expandedHotel: null,
    handleToggleHotelDetails: mockToggleHotelDetails,
    takingShuttle: true,
    setTakingShuttle: mockSetTakingShuttle,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing for Unknown preference.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceDescription {...defaultProps} />
      </ThemeProvider>
    );

    // Nothing should be rendered for Unknown
    expect(screen.queryByTestId('camping-description')).not.toBeInTheDocument();
    expect(screen.queryByTestId('manor-description')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hotel-list-component')).not.toBeInTheDocument();
  });

  it('should render camping description when Camping is selected.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceDescription 
          {...defaultProps} 
          campingValue={SleepPreferenceEnum.Camping} 
        />
      </ThemeProvider>
    );

    // Camping description should be visible
    expect(screen.getByTestId('camping-description')).toBeInTheDocument();
    expect(screen.getByText(/Camp with us at the venue!/)).toBeInTheDocument();
    
    // Other elements should not be visible
    expect(screen.queryByTestId('manor-description')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hotel-list-component')).not.toBeInTheDocument();
  });

  it('should render manor description when Manor is selected.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceDescription 
          {...defaultProps} 
          campingValue={SleepPreferenceEnum.Manor} 
        />
      </ThemeProvider>
    );

    // Manor description should be visible
    expect(screen.getByTestId('manor-description')).toBeInTheDocument();
    expect(screen.getByText(/Stay in our Manor House!/)).toBeInTheDocument();
    
    // Other elements should not be visible
    expect(screen.queryByTestId('camping-description')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hotel-list-component')).not.toBeInTheDocument();
  });

  it('should render hotel list when Hotel is selected.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceDescription 
          {...defaultProps} 
          campingValue={SleepPreferenceEnum.Hotel} 
        />
      </ThemeProvider>
    );

    // Hotel list should be visible
    expect(screen.getByTestId('hotel-list-component')).toBeInTheDocument();
    
    // Other elements should not be visible
    expect(screen.queryByTestId('camping-description')).not.toBeInTheDocument();
    expect(screen.queryByTestId('manor-description')).not.toBeInTheDocument();
  });
});