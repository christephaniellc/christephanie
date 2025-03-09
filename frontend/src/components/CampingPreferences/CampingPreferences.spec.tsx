import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CampingPreferences from './CampingPreferences';
import { RecoilRoot } from 'recoil';
import { ThemeProvider, createTheme } from '@mui/material';
import { guestSelector } from '@/store/family';
import { GuestViewModel, InvitationResponseEnum, RoleEnum, SleepPreferenceEnum } from '@/types/api';

// Mock useFamily hook
jest.mock('@/store/family', () => ({
  guestSelector: jest.fn(),
  useFamily: () => [
    null,
    {
      updateFamilyGuestSleepingPreference: jest.fn(),
      patchFamilyMutation: { isPending: false },
      getFamilyUnitQuery: { isFetching: false },
    },
  ],
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

// Sample guest data
const regularGuest: GuestViewModel = {
  guestId: '123',
  firstName: 'John',
  lastName: 'Doe',
  roles: [RoleEnum.Guest],
  preferences: {
    sleepPreference: SleepPreferenceEnum.Unknown,
  },
  rsvp: {
    invitationResponse: InvitationResponseEnum.Interested
  }
};

const manorGuest: GuestViewModel = {
  guestId: '456',
  firstName: 'Jane',
  lastName: 'Smith',
  roles: [RoleEnum.Guest, RoleEnum.Manor],
  preferences: {
    sleepPreference: SleepPreferenceEnum.Unknown,
  },
  rsvp: {
    invitationResponse: InvitationResponseEnum.Interested
  }
};

const hotelGuest: GuestViewModel = {
  guestId: '789',
  firstName: 'Bob',
  lastName: 'Johnson',
  roles: [RoleEnum.Guest],
  preferences: {
    sleepPreference: SleepPreferenceEnum.Hotel,
  },
  rsvp: {
    invitationResponse: InvitationResponseEnum.Interested
  }
};

// Create theme for testing
const theme = createTheme();

describe('CampingPreferences.locked', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should not show Manor option for regular guests.locked', async () => {
    // Mock the guestSelector to return a regular guest
    (guestSelector as jest.Mock).mockReturnValue(regularGuest);

    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CampingPreferences guestId="123" />
        </ThemeProvider>
      </RecoilRoot>
    );

    // Regular options should be visible
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();

    // Manor option should not be visible
    expect(screen.queryByText('Manor')).not.toBeInTheDocument();
  });

  it('should show Manor option for guests with the Manor role.locked', async () => {
    // Mock the guestSelector to return a guest with Manor role
    (guestSelector as jest.Mock).mockReturnValue(manorGuest);

    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CampingPreferences guestId="456" />
        </ThemeProvider>
      </RecoilRoot>
    );

    // All options should be visible, including Manor
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('Manor')).toBeInTheDocument();
  });

  it('should show the Manor description when Manor option is selected.locked', async () => {
    // Mock the guestSelector to return a guest with Manor role
    (guestSelector as jest.Mock).mockReturnValue(manorGuest);

    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CampingPreferences guestId="456" />
        </ThemeProvider>
      </RecoilRoot>
    );

    // Select Manor option
    const manorButton = screen.getByText('Manor');
    fireEvent.click(manorButton);

    // Check that the Manor description appears
    await waitFor(() => {
      expect(screen.getByText(/Stay in our Manor House!/)).toBeInTheDocument();
    });
  });
});

describe('Hotel Options Collapsible UI.wip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the guestSelector to return a guest with Hotel preference
    (guestSelector as jest.Mock).mockReturnValue(hotelGuest);
  });

  it('should show hotel options as collapsed buttons by default.wip', async () => {
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CampingPreferences guestId="789" />
        </ThemeProvider>
      </RecoilRoot>
    );

    // Hotel section should be visible
    const hotelOptionsContainer = screen.getByTestId('hotel-options-container');
    expect(hotelOptionsContainer).toBeInTheDocument();

    // All hotel options should be visible as buttons
    expect(screen.getByText('Holiday Inn Express Suites - Brunswick, MD')).toBeInTheDocument();
    expect(screen.getByText('Holiday Inn Express Charles Town, Ranson, WV')).toBeInTheDocument();
    expect(screen.getByText('Lovettsville Area Hotels')).toBeInTheDocument();

    // But details should be hidden initially
    expect(screen.queryByText('Drive time to venue: 18 mins')).not.toBeInTheDocument();
    expect(screen.queryByText('Drive time to venue: 23 mins')).not.toBeInTheDocument();
    expect(screen.queryByText('Search on Google')).not.toBeInTheDocument();
  });

  it('should expand hotel details when clicked.wip', async () => {
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <CampingPreferences guestId="789" />
        </ThemeProvider>
      </RecoilRoot>
    );

    // Click on the first hotel option
    const firstHotelButton = screen.getByTestId('hotel-button-0');
    fireEvent.click(firstHotelButton);

    // First hotel details should be visible
    await waitFor(() => {
      expect(screen.getByText('Drive time to venue: 18 mins')).toBeInTheDocument();
      expect(screen.getByText('Shuttle Available')).toBeInTheDocument();
      
      // Google search button should be visible
      const searchButtons = screen.getAllByText('Search on Google');
      expect(searchButtons.length).toBe(1);
    });

    // Other hotel details should still be hidden
    expect(screen.queryByText('Drive time to venue: 23 mins')).not.toBeInTheDocument();

    // Click on the second hotel option
    const secondHotelButton = screen.getByTestId('hotel-button-1');
    fireEvent.click(secondHotelButton);

    // Second hotel details should be visible and first should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Drive time to venue: 18 mins')).not.toBeInTheDocument();
      expect(screen.getByText('Drive time to venue: 23 mins')).toBeInTheDocument();
    });

    // Click again on the second hotel to collapse it
    fireEvent.click(secondHotelButton);

    // All details should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('Drive time to venue: 23 mins')).not.toBeInTheDocument();
      expect(screen.queryByText('Drive time to venue: 18 mins')).not.toBeInTheDocument();
    });
  });
});