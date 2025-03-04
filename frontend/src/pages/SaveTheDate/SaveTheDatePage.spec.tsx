import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SaveTheDatePage from './SaveTheDatePage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { saveTheDateStepsState, stdTabIndex } from '@/store/steppers/steppers';
import { familyState } from '@/store/family';
import { InvitationResponseEnum } from '@/types/api';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from '@/theme/themes';

// Mock useAuth0
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: { sub: 'user123' },
    isLoading: false,
  }),
}));

// Mock useAppLayout
jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => ({
    contentHeight: 800,
    screenWidth: 1024,
  }),
}));

// Mock useBoxShadow
jest.mock('@/hooks/useBoxShadow', () => ({
  useBoxShadow: () => ({
    handleMouseMove: jest.fn(),
    boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  }),
}));

const renderWithProviders = (
  ui: React.ReactElement,
  { 
    initialFamilyState = null,
    initialStepsState = {},
    initialTabIndex = 0,
  } = {}
) => {
  return render(
    <RecoilRoot initializeState={(snap) => {
      snap.set(familyState, initialFamilyState);
      snap.set(saveTheDateStepsState, initialStepsState);
      snap.set(stdTabIndex, initialTabIndex);
    }}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={['/save-the-date']}>
          <Routes>
            <Route path="/save-the-date" element={ui} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </RecoilRoot>
  );
};

const mockFamily = {
  invitationCode: 'TEST123',
  unitName: 'Test Family',
  guests: [
    {
      guestId: '1',
      firstName: 'John',
      lastName: 'Doe',
      rsvp: {
        invitationResponse: InvitationResponseEnum.Interested,
      },
    },
    {
      guestId: '2',
      firstName: 'Jane',
      lastName: 'Doe',
      rsvp: {
        invitationResponse: InvitationResponseEnum.Declined,
      },
    },
  ],
  getFamilyUnitQuery: { isFetching: false },
  getFamily: jest.fn(),
  updateFamilyGuestInterest: jest.fn(),
  patchFamilyGuestMutation: { isPending: false, isIdle: true },
  patchFamilyMutation: { isPending: false, isIdle: true },
};

const mockSteps = {
  'step1': {
    id: 0,
    completed: false,
    label: 'Step 1',
    description: '',
    component: null,
    display: true,
  },
  'step2': {
    id: 1,
    completed: false,
    label: 'Step 2',
    description: '',
    component: null,
    display: true,
  },
  'step3': {
    id: 2,
    completed: false,
    label: 'Step 3',
    description: '',
    component: null,
    display: false, // This step is hidden
  },
  'step4': {
    id: 3,
    completed: false,
    label: 'Step 4',
    description: '',
    component: null,
    display: true,
  },
};

describe('SaveTheDatePage navigation.locked', () => {
  it('should skip hidden steps when navigating with Next button.locked', () => {
    renderWithProviders(<SaveTheDatePage />, {
      initialFamilyState: mockFamily,
      initialStepsState: mockSteps,
      initialTabIndex: 1, // Start at step2
    });

    // Find the Next button and click it
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // It should skip step3 (hidden) and go to step4
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('should go to the last visible step when all guests are declined.locked', () => {
    const allDeclinedFamily = {
      ...mockFamily,
      guests: [
        {
          guestId: '1',
          firstName: 'John',
          lastName: 'Doe',
          rsvp: {
            invitationResponse: InvitationResponseEnum.Declined,
          },
        },
        {
          guestId: '2',
          firstName: 'Jane',
          lastName: 'Doe',
          rsvp: {
            invitationResponse: InvitationResponseEnum.Declined,
          },
        },
      ],
    };

    renderWithProviders(<SaveTheDatePage />, {
      initialFamilyState: allDeclinedFamily,
      initialStepsState: mockSteps,
      initialTabIndex: 0, // Start at step1
    });

    // Find the Next button and click it
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // It should skip to the last visible step (step4)
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });
});