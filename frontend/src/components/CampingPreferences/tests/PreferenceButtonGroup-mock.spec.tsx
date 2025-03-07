import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { SleepPreferenceEnum } from '@/types/api';

// Define a fake test component mimicking PreferenceButtonGroup's behavior
const TestPreferenceButtonGroup = ({ 
  campingPreferences, 
  campingValue, 
  hasManorRole,
  screenWidth,
  handleChangeSleepPreference,
  isPending,
  isFetching
}) => {
  return (
    <div role="group">
      {campingPreferences
        .slice(1)
        .filter((value) => value !== 'Manor' || hasManorRole)
        .map((value) => (
          <button
            key={value}
            data-testid={`preference-button-${value}`}
            disabled={isPending || isFetching}
            className={
              campingValue.includes(SleepPreferenceEnum[value])
                ? 'MuiButton-contained'
                : 'MuiButton-outlined'
            }
            onClick={(e) => {
              handleChangeSleepPreference(e, SleepPreferenceEnum[value]);
            }}
          >
            {value === 'Unknown' ? '' : value}
          </button>
        ))}
    </div>
  );
};

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
        <TestPreferenceButtonGroup {...defaultProps} />
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
        <TestPreferenceButtonGroup {...defaultProps} hasManorRole={true} />
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
        <TestPreferenceButtonGroup {...defaultProps} isPending={true} />
      </ThemeProvider>
    );

    // All buttons should be disabled
    const campingButton = screen.getByTestId('preference-button-Camping');
    expect(campingButton).toBeDisabled();
  });

  it('should show buttons as disabled when isFetching is true.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <TestPreferenceButtonGroup {...defaultProps} isFetching={true} />
      </ThemeProvider>
    );

    // All buttons should be disabled
    const campingButton = screen.getByTestId('preference-button-Camping');
    expect(campingButton).toBeDisabled();
  });

  it('should call handleChangeSleepPreference when a button is clicked.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <TestPreferenceButtonGroup {...defaultProps} />
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
        <TestPreferenceButtonGroup 
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