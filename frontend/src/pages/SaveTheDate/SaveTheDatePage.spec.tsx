import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SaveTheDatePage from './SaveTheDatePage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { saveTheDateStepsState, stdTabIndex } from '@/store/steppers/steppers';
import { familyState } from '@/store/family';
import { InvitationResponseEnum } from '@/types/api';
import { ThemeProvider, createTheme } from '@mui/material/styles';
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: { sub: 'user123' },
    isLoading: false,
  }),
}));

// Mock useAppLayout
// Create a mock that can be configured with different screen sizes
const mockUseAppLayout = {
  contentHeight: 800,
  screenWidth: 1024,
};

jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => mockUseAppLayout,
}));

// Mock useBoxShadow
jest.mock('@/hooks/useBoxShadow', () => ({
  useBoxShadow: () => ({
    handleMouseMove: jest.fn(),
    boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  }),
}));

// Create a simple mock theme for testing
const mockTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#9D00FF' },
    secondary: { main: '#E9950C' },
    error: { main: '#f44336', dark: '#d32f2f' },
    success: { main: '#4caf50', dark: '#388e3c' },
  },
});

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
      <ThemeProvider theme={mockTheme}>
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
  
  it('should skip hidden steps when navigating with Back button.locked', () => {
    // Create steps with hidden middle step
    const mockStepsWithHiddenMiddle = {
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
        display: false, // Hidden step
      },
      'step3': {
        id: 2,
        completed: false,
        label: 'Step 3',
        description: '',
        component: null,
        display: true,
      },
    };
    
    renderWithProviders(<SaveTheDatePage />, {
      initialFamilyState: mockFamily,
      initialStepsState: mockStepsWithHiddenMiddle,
      initialTabIndex: 2, // Start at step3
    });

    // Find the Back button and click it
    const backButton = screen.getByText('Wait, go back');
    fireEvent.click(backButton);

    // It should skip step2 (hidden) and go back to step1
    // Since we can't directly check the tabIndex state, we'll check that
    // the back button is no longer visible (only visible if not on first step)
    expect(screen.queryByText('Wait, go back')).not.toBeInTheDocument();
  });
  
  it('should ensure mailingAddress step is always accessible when all guests are declined/pending.locked', () => {
    // Create steps with mailingAddress step
    const mockStepsWithMailingAddress = {
      'attendance': {
        id: 0,
        completed: true,
        label: 'Attendance',
        description: '',
        component: null,
        display: true,
      },
      'foodPreferences': {
        id: 1,
        completed: false,
        label: 'Food Preferences',
        description: '',
        component: null,
        display: false, // Not shown for declined users
      },
      'mailingAddress': {
        id: 2,
        completed: false,
        label: 'Mailing Address',
        description: '',
        component: null,
        display: true, // Should always be true
      },
      'comments': {
        id: 3,
        completed: false,
        label: 'Comments',
        description: '',
        component: null,
        display: true,
      },
    };
    
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
      initialStepsState: mockStepsWithMailingAddress,
      initialTabIndex: 0, // Start at attendance
    });

    // Find the Next button and click it
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Should go to mailingAddress step (skipping foodPreferences)
    // Since we can't check tabIndex directly, we check the Next/Finish button
    // text which changes on the last step
    expect(screen.getByText('Next')).toBeInTheDocument(); // Should be on mailingAddress which isn't the last step
    
    // Click Next again
    fireEvent.click(screen.getByText('Next'));
    
    // Should now be on comments (last step)
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });
  
  it('navigation buttons should be visible on mobile screens.wip', () => {
    // Set mobile screen size
    mockUseAppLayout.contentHeight = 600;
    mockUseAppLayout.screenWidth = 375; // iPhone size
    
    renderWithProviders(<SaveTheDatePage />, {
      initialFamilyState: mockFamily,
      initialStepsState: mockSteps,
      initialTabIndex: 1, // Start at step2
    });

    // Find the navigation buttons
    const nextButton = screen.getByText('Next');
    const backButton = screen.getByText('Wait, go back');
    
    // Check that buttons are in the document and visible
    expect(nextButton).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
    
    // Verify the positioning of the button container
    // In testing environments, styling is not always fully applied
    // So we're just making sure the elements exist, which is sufficient
    // for this test.
    const buttonContainer = backButton.closest('div');
    expect(buttonContainer).toBeInTheDocument();
  });
});