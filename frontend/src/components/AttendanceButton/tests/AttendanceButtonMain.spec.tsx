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

jest.mock('@/components/WeddingAttendanceRadios', () => ({
  __esModule: true,
  default: ({ guestId, initialModalOpen, onModalClose }) => (
    <div data-testid="wedding-attendance-radios">
      {initialModalOpen ? 'Modal Open' : 'Modal Closed'}
    </div>
  )
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
    
    // Modal should not be rendered initially
    expect(screen.queryByTestId('wedding-attendance-radios')).not.toBeInTheDocument();
  });
  
  it('shows the modal when clicked', () => {
    const theme = createTheme();
    
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceButtonMain guestId="test-guest-id" />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Click the button to open modal
    fireEvent.click(screen.getByRole('button'));
    
    // Modal should be rendered now
    expect(screen.getByTestId('wedding-attendance-radios')).toBeInTheDocument();
    expect(screen.getByText('Modal Open')).toBeInTheDocument();
  });
});