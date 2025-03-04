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