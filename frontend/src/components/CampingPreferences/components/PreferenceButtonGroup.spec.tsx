import React from 'react';
import { render, screen } from '@testing-library/react';
import PreferenceButtonGroup from './PreferenceButtonGroup';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SleepPreferenceEnum } from '@/types/api';

// Create theme for testing
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const mockCampingPreferences = ['Unknown', 'Camping', 'Hotel', 'Manor'];
const mockHandleChangeSleepPreference = jest.fn();

describe('PreferenceButtonGroup component [ wip]', () => {
  it('renders all preference buttons except Unknown [ wip]', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup
          campingPreferences={mockCampingPreferences}
          campingValue={SleepPreferenceEnum.Unknown}
          hasManorRole={true}
          screenWidth={375}
          handleChangeSleepPreference={mockHandleChangeSleepPreference}
          isPending={false}
          isFetching={false}
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.getByText('Manor')).toBeInTheDocument();
    // Unknown should be filtered out
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
  });
  
  it('highlights the selected camping value [ wip]', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup
          campingPreferences={mockCampingPreferences}
          campingValue={SleepPreferenceEnum.Camping}
          hasManorRole={true}
          screenWidth={375}
          handleChangeSleepPreference={mockHandleChangeSleepPreference}
          isPending={false}
          isFetching={false}
        />
      </ThemeProvider>
    );
    
    // Find the buttons
    const campingButton = screen.getByTestId('preference-button-Camping');
    const hotelButton = screen.getByTestId('preference-button-Hotel');
    
    // Camping button should have the 'contained' variant (selected)
    expect(campingButton).toHaveClass('MuiButton-contained');
    // Hotel button should have the 'outlined' variant (not selected)
    expect(hotelButton).toHaveClass('MuiButton-outlined');
  });
  
  it('hides Manor option when user does not have Manor role [ wip]', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup
          campingPreferences={mockCampingPreferences}
          campingValue={SleepPreferenceEnum.Unknown}
          hasManorRole={false}
          screenWidth={375}
          handleChangeSleepPreference={mockHandleChangeSleepPreference}
          isPending={false}
          isFetching={false}
        />
      </ThemeProvider>
    );
    
    // Manor button should not be rendered
    expect(screen.queryByText('Manor')).not.toBeInTheDocument();
  });
  
  it('applies mobile-first styling using theme breakpoints [ wip]', () => {
    render(
      <ThemeProvider theme={theme}>
        <PreferenceButtonGroup
          campingPreferences={mockCampingPreferences}
          campingValue={SleepPreferenceEnum.Unknown}
          hasManorRole={true}
          screenWidth={375}
          handleChangeSleepPreference={mockHandleChangeSleepPreference}
          isPending={false}
          isFetching={false}
        />
      </ThemeProvider>
    );
    
    // ButtonGroup should have vertical orientation by default for mobile
    const buttonGroup = screen.getByRole('group');
    expect(buttonGroup).toHaveClass('MuiButtonGroup-vertical');
  });
});