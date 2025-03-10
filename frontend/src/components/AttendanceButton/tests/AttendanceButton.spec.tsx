import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { AttendanceButton } from '../AttendanceButton';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// Mock the necessary components
jest.mock('@/store/family', () => ({
  guestSelector: () => jest.fn(() => ({
    guestId: 'test-guest-id',
    rsvp: {
      invitationResponse: 'Pending'
    },
    preferences: {
      foodAllergies: []
    }
  })),
  useFamily: () => [null, {
    patchFamilyGuestMutation: {
      isIdle: true,
      isPending: false,
      error: null
    },
    getFamilyUnitQuery: {
      isFetching: false
    },
    patchFamilyMutation: {
      isIdle: true,
      isPending: false,
      error: null
    },
    updateFamilyGuestInterest: jest.fn()
  }]
}));

jest.mock('../components/AttendanceButtonMain', () => ({
  AttendanceButtonMain: ({ guestId }: { guestId: string }) => <div data-testid="attendance-button-main">AttendanceButtonMain</div>
}));

jest.mock('../components/AttendanceButtonStatus', () => ({
  AttendanceButtonStatus: ({ guestId }: { guestId: string }) => <div data-testid="attendance-button-status">AttendanceButtonStatus</div>
}));

jest.mock('@/store/steppers/steppers', () => ({
  stdStepperState: {
    currentStep: ['attendance'],
    tabIndex: 0,
    totalTabs: 5
  },
  stdTabIndex: 0
}));

describe('AttendanceButton', () => {
  it('renders the component with child components', () => {
    const theme = createTheme();
    
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceButton guestId="test-guest-id" />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    expect(screen.getByTestId('attendance-button')).toBeInTheDocument();
    expect(screen.getByTestId('attendance-button-main')).toBeInTheDocument();
    expect(screen.getByTestId('attendance-button-status')).toBeInTheDocument();
  });
});