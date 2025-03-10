import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { AttendanceButtonMain } from '../components/AttendanceButtonMain';

// Mock necessary hooks and components
jest.mock('../hooks/useAttendanceButtonMain', () => ({
  useAttendanceButtonMain: () => ({
    familyActions: {
      patchFamilyGuestMutation: {
        isIdle: true,
      },
      getFamilyUnitQuery: {
        isFetching: false
      },
      patchFamilyMutation: {
        isPending: false,
        error: null
      }
    },
    handleClick: jest.fn(),
    guest: {
      guestId: 'test-guest-id',
      rsvp: {
        invitationResponse: 'Pending'
      }
    },
    imgButtonSxProps: {},
    calculateShadow: () => '5px 5px 0px #000',
    stdStepper: {
      tabIndex: 0
    }
  })
}));

jest.mock('@/components/AttendanceButton/ClientSideImportedComponents/LargeAttendanceButton', () => ({
  __esModule: true,
  default: ({ guestId }: { guestId: string }) => <div data-testid="large-attendance-button">LargeAttendanceButton</div>
}));

describe('AttendanceButtonMain', () => {
  it('renders the component correctly', () => {
    const theme = createTheme();
    
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceButtonMain guestId="test-guest-id" />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('large-attendance-button')).toBeInTheDocument();
  });
});