import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider, createTheme } from '@mui/material';
import CampingPreferences from '../CampingPreferences';
import { useCampingPreferences } from '../hooks';
import { PreferenceButtonGroup, PreferenceDescription } from '../components';

// Mock the components and hooks
jest.mock('../hooks', () => ({
  useCampingPreferences: jest.fn(),
}));

jest.mock('../components', () => ({
  PreferenceButtonGroup: jest.fn(() => <div data-testid="mock-preference-button-group">Mocked PreferenceButtonGroup</div>),
  PreferenceDescription: jest.fn(() => <div data-testid="mock-preference-description">Mocked PreferenceDescription</div>),
}));

// Mock hooks
jest.mock('@/hooks/useBoxShadow', () => ({
  useBoxShadow: () => ({
    boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
    handleMouseMove: jest.fn(),
  }),
}));

jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => ({
    screenWidth: 1024,
  }),
}));

const theme = createTheme();

describe('CampingPreferences Component.wip', () => {
  const mockHookResult = {
    campingPreferences: ['Unknown', 'Camping', 'Hotel', 'Manor', 'Other'],
    campingValue: 'Unknown',
    hasManorRole: false,
    hotelOptions: [],
    expandedHotel: null,
    takingShuttle: true,
    setTakingShuttle: jest.fn(),
    handleChangeSleepPreference: jest.fn(),
    handleToggleHotelDetails: jest.fn(),
    isPending: false,
    isFetching: false,
    popoverId: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCampingPreferences as jest.Mock).mockReturnValue(mockHookResult);
  });

  it('should render the main container correctly.wip', () => {
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CampingPreferences guestId="123" />
        </ThemeProvider>
      </RecoilRoot>
    );

    // Check that the main container is rendered
    expect(screen.getByTestId('camping-preferences-container')).toBeInTheDocument();
  });

  it('should pass correct props to PreferenceButtonGroup.wip', () => {
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CampingPreferences guestId="123" />
        </ThemeProvider>
      </RecoilRoot>
    );

    // Check that PreferenceButtonGroup is rendered with mocked content
    expect(screen.getByTestId('mock-preference-button-group')).toBeInTheDocument();
    
    // Check the props passed to PreferenceButtonGroup
    expect(PreferenceButtonGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        campingPreferences: mockHookResult.campingPreferences,
        campingValue: mockHookResult.campingValue,
        hasManorRole: mockHookResult.hasManorRole,
        screenWidth: 1024,
        handleChangeSleepPreference: mockHookResult.handleChangeSleepPreference,
        isPending: mockHookResult.isPending,
        isFetching: mockHookResult.isFetching,
      }),
      expect.anything()
    );
  });

  it('should pass correct props to PreferenceDescription.wip', () => {
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CampingPreferences guestId="123" />
        </ThemeProvider>
      </RecoilRoot>
    );

    // Check that PreferenceDescription is rendered with mocked content
    expect(screen.getByTestId('mock-preference-description')).toBeInTheDocument();
    
    // Check the props passed to PreferenceDescription
    expect(PreferenceDescription).toHaveBeenCalledWith(
      expect.objectContaining({
        campingValue: mockHookResult.campingValue,
        hotelOptions: mockHookResult.hotelOptions,
        expandedHotel: mockHookResult.expandedHotel,
        handleToggleHotelDetails: mockHookResult.handleToggleHotelDetails,
        takingShuttle: mockHookResult.takingShuttle,
        setTakingShuttle: mockHookResult.setTakingShuttle,
      }),
      expect.anything()
    );
  });

  it('should call useCampingPreferences hook with the correct guestId.wip', () => {
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CampingPreferences guestId="123" />
        </ThemeProvider>
      </RecoilRoot>
    );

    expect(useCampingPreferences).toHaveBeenCalledWith('123');
  });
});