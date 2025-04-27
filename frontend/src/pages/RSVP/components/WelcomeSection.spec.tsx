import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { WelcomeSection } from './WelcomeSection';
import { RsvpEnum } from '@/types/api';

// Create a mock for the updateFamilyGuestRsvp function
const mockUpdateFamilyGuestRsvp = jest.fn();

// Create a mock family state that we can modify between tests
const createMockFamily = (weddingStatus = RsvpEnum.Pending) => ({
  guests: [
    {
      guestId: 'test-guest-id',
      firstName: 'Test Guest',
      lastName: 'Doe',
      rsvp: {
        wedding: weddingStatus,
      },
    },
  ],
});

// Mock necessary dependencies
jest.mock('@/store/family', () => {
  // Return the mock factory function to allow test-specific configurations
  return {
    useFamily: () => {
      const mockFamilyActions = {
        getFamily: jest.fn(),
        updateFamilyGuestRsvp: mockUpdateFamilyGuestRsvp,
        patchFamilyGuestMutation: {
          status: 'idle',
          isPending: false,
        },
        getFamilyUnitQuery: { isFetching: false },
      };

      // The mock implementation can access this variable from the outer scope
      return [mockFamilyState, mockFamilyActions];
    },
  };
});

jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => ({
    screenWidth: 1024,
  }),
}));

jest.mock('@/hooks/useBoxShadow', () => ({
  useBoxShadow: () => ({
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  }),
}));

// Mock styled components
jest.mock('@/components/AttendanceButton/components/StyledComponents', () => ({
  StephsActualFavoriteTypographyNoDrop: ({ children, ...props }: any) => (
    <div data-testid="styled-typography-no-drop" {...props}>{children}</div>
  ),
  StephsStyledTypography: ({ children, ...props }: any) => (
    <div data-testid="styled-typography" {...props}>{children}</div>
  ),
}));

// We need to declare the mockFamilyState outside the describe block
// so it can be accessed in the mock
let mockFamilyState = createMockFamily();

describe('WelcomeSection Component', () => {
  const theme = createTheme();
  
  beforeEach(() => {
    // Clear mock function calls
    jest.clearAllMocks();
    // Reset the mock family state
    mockFamilyState = createMockFamily();
  });

  it('should set to Pending when clicking the same button as current status', () => {
    // Set the initial state to Attending
    mockFamilyState = createMockFamily(RsvpEnum.Attending);
    
    // Render the component
    const { container } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <WelcomeSection />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Find and click the "I'll be there" button (which matches current Attending status)
    const attendButton = container.querySelectorAll('button')[0];
    fireEvent.click(attendButton);
    
    // Verify it sets to Pending because the current status matches the button clicked
    expect(mockUpdateFamilyGuestRsvp).toHaveBeenCalledWith('test-guest-id', RsvpEnum.Pending);
  });
  
  it('should set to Attending when clicking Attend with a different current status', () => {
    // Set the initial state to Declined
    mockFamilyState = createMockFamily(RsvpEnum.Declined);
    
    // Render the component
    const { container } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <WelcomeSection />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Find and click the "I'll be there" button (current status is Declined)
    const attendButton = container.querySelectorAll('button')[0];
    fireEvent.click(attendButton);
    
    // Verify it sets to Attending because current status differs from button clicked
    expect(mockUpdateFamilyGuestRsvp).toHaveBeenCalledWith('test-guest-id', RsvpEnum.Attending);
  });
  
  it('should set to Declined when clicking Decline with a different current status', () => {
    // Set the initial state to Attending
    mockFamilyState = createMockFamily(RsvpEnum.Attending);
    
    // Render the component
    const { container } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <WelcomeSection />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Find and click the "Cannot attend" button (current status is Attending)
    const declineButton = container.querySelectorAll('button')[1];
    fireEvent.click(declineButton);
    
    // Verify it sets to Declined because current status differs from button clicked
    expect(mockUpdateFamilyGuestRsvp).toHaveBeenCalledWith('test-guest-id', RsvpEnum.Declined);
  });
  
  it('should set to Pending when clicking Decline with a current Declined status', () => {
    // Set the initial state to Declined
    mockFamilyState = createMockFamily(RsvpEnum.Declined);
    
    // Render the component
    const { container } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <WelcomeSection />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Find and click the "Cannot attend" button (which matches current Declined status)
    const declineButton = container.querySelectorAll('button')[1];
    fireEvent.click(declineButton);
    
    // Verify it sets to Pending because the current status matches the button clicked
    expect(mockUpdateFamilyGuestRsvp).toHaveBeenCalledWith('test-guest-id', RsvpEnum.Pending);
  });
});