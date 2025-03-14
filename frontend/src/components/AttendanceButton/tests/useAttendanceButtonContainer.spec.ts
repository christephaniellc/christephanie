import { renderHook } from '@testing-library/react-hooks';
import { RecoilRoot } from 'recoil';
import { useAttendanceButtonContainer } from '../hooks/useAttendanceButtonContainer';
import { InvitationResponseEnum } from '@/types/api';
import React from 'react';
import { createTheme } from '@mui/material';

// Mock dependencies
jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilValue: jest.fn().mockImplementation(() => ({
    guestId: 'test-guest-id',
    rsvp: {
      invitationResponse: InvitationResponseEnum.Pending
    }
  }))
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: jest.fn().mockImplementation(() => ({
    palette: {
      primary: { main: '#1976d2' },
      error: { main: '#d32f2f' },
      secondary: { main: '#9c27b0' },
      info: { main: '#0288d1' }
    },
    breakpoints: {
      up: jest.fn()
    }
  }))
}));

describe('useAttendanceButtonContainer', () => {
  it('returns the expected values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>{children}</RecoilRoot>
    );
    
    const { result } = renderHook(() => useAttendanceButtonContainer({ guestId: 'test-guest-id' }), { wrapper });
    
    expect(result.current).toHaveProperty('semiTransparentBackgroundColor');
    expect(result.current).toHaveProperty('theme');
    expect(result.current).toHaveProperty('guest');
  });
});