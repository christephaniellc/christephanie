import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { SleepPreferenceEnum } from '@/types/api';
import PreferenceButtonGroup from '../components/PreferenceButtonGroup';

const theme = createTheme();

describe('PreferenceButtonGroup Component.wip', () => {
  const mockHandleChangeSleepPreference = jest.fn();
  const defaultProps = {
    campingPreferences: Object.keys(SleepPreferenceEnum),
    campingValue: SleepPreferenceEnum.Unknown,
    hasManorRole: false,
    screenWidth: 1024,
    handleChangeSleepPreference: mockHandleChangeSleepPreference,
    isPending: false,
    isFetching: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render buttons for valid preferences except Manor by default.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup {...defaultProps} />
      </ThemeProvider>
    );

    // Regular options should be visible
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
    
    // Manor option should not be visible
    expect(screen.queryByText('Manor')).not.toBeInTheDocument();
  });

  it('should render the Manor option when hasManorRole is true.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup {...defaultProps} hasManorRole={true} />
      </ThemeProvider>
    );

    // All options should be visible, including Manor
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('Manor')).toBeInTheDocument();
  });

  it('should show buttons as disabled when isPending is true.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup {...defaultProps} isPending={true} />
      </ThemeProvider>
    );

    // All buttons should be disabled
    const campingButton = screen.getByTestId('preference-button-Camping');
    expect(campingButton).toBeDisabled();
  });

  it('should show buttons as disabled when isFetching is true.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup {...defaultProps} isFetching={true} />
      </ThemeProvider>
    );

    // All buttons should be disabled
    const campingButton = screen.getByTestId('preference-button-Camping');
    expect(campingButton).toBeDisabled();
  });

  it('should call handleChangeSleepPreference when a button is clicked.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup {...defaultProps} />
      </ThemeProvider>
    );

    // Click on the Camping button
    const campingButton = screen.getByText('Camping');
    fireEvent.click(campingButton);

    // Check that the handler was called with the right arguments
    expect(mockHandleChangeSleepPreference).toHaveBeenCalledTimes(1);
    expect(mockHandleChangeSleepPreference).toHaveBeenCalledWith(
      expect.anything(),
      SleepPreferenceEnum.Camping
    );
  });

  it('should highlight the active preference button.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup 
          {...defaultProps} 
          campingValue={SleepPreferenceEnum.Camping} 
        />
      </ThemeProvider>
    );

    // The Camping button should have the 'contained' variant
    const campingButton = screen.getByTestId('preference-button-Camping');
    expect(campingButton).toHaveClass('MuiButton-contained');
    
    // The other buttons should have the 'outlined' variant
    const hotelButton = screen.getByTestId('preference-button-Hotel');
    expect(hotelButton).toHaveClass('MuiButton-outlined');
  });
});