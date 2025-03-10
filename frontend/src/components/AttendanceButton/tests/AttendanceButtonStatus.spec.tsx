import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { AttendanceButtonStatus } from '../components/AttendanceButtonStatus';
import { InvitationResponseEnum } from '@/types/api';

// Mock necessary hooks
jest.mock('../hooks/useAttendanceButtonStatus', () => ({
  useAttendanceButtonStatus: () => ({
    theme: createTheme(),
    stdStepper: {
      tabIndex: 0
    },
    guest: {
      rsvp: {
        invitationResponse: InvitationResponseEnum.Pending
      }
    },
    daysUntilDeadline: 30,
    handleGoToAttendanceStep: jest.fn(),
    getResponseColor: () => '#f00'
  })
}));

jest.mock('../hooks/useAttendanceButtonMain', () => ({
  useAttendanceButtonMain: () => ({
    handleClick: jest.fn(),
    calculateShadow: () => '5px 5px 0px #000'
  })
}));

describe('AttendanceButtonStatus', () => {
  it('renders the status button for Pending response', () => {
    const theme = createTheme();
    
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceButtonStatus guestId="test-guest-id" />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(/Click to update your response/i)).toBeInTheDocument();
    expect(screen.getByText(/30 days left to respond/i)).toBeInTheDocument();
  });
});