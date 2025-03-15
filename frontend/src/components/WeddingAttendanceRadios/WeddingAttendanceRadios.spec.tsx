import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import WeddingAttendanceRadios from './WeddingAttendanceRadios';

// Mock necessary dependencies
jest.mock('@/store/family', () => ({
  guestSelector: () => jest.fn(() => ({
    guestId: 'test-guest-id',
    firstName: 'Test Guest',
    rsvp: {
      invitationResponse: 'Pending',
      wedding: 'Attending',
      rehearsalDinner: 'Pending'
    },
    preferences: {
      foodPreference: 'Omnivore',
      foodAllergies: []
    },
    ageGroup: 'Adult'
  })),
  familyState: {
    id: 'test-family-id',
    mailingAddress: {
      uspsVerified: true
    },
    invitationResponseNotes: ''
  },
  useFamily: () => [null, {
    patchFamilyGuestMutation: {
      mutate: jest.fn()
    }
  }]
}));

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: {
      sub: 'auth0|123'
    }
  })
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    getQueryState: () => ({
      fetchStatus: 'idle'
    })
  })
}));

jest.mock('@/hooks/useBoxShadow', () => ({
  useBoxShadow: () => ({
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  })
}));

jest.mock('@/components/StickFigureIcon', () => ({
  __esModule: true,
  default: () => <div data-testid="stick-figure-icon" />
}));

describe('WeddingAttendanceRadios', () => {
  const theme = createTheme();
  
  it('renders the content without a modal by default', () => {
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <WeddingAttendanceRadios guestId="test-guest-id" />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Modal should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    
    // Content should be visible
    expect(screen.getByText(/Omnivore adult/i)).toBeInTheDocument();
  });
  
  it('opens modal when initialModalOpen is true', () => {
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <WeddingAttendanceRadios guestId="test-guest-id" initialModalOpen={true} />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Modal should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Test Guest's Details/i)).toBeInTheDocument();
    
    // Close button should be visible
    const closeButton = screen.getByLabelText(/close/i);
    expect(closeButton).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(closeButton);
    
    // Modal should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  
  it('calls onModalClose callback when modal is closed', () => {
    const onModalCloseMock = jest.fn();
    
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <WeddingAttendanceRadios 
            guestId="test-guest-id" 
            initialModalOpen={true} 
            onModalClose={onModalCloseMock} 
          />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Modal should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByLabelText(/close/i));
    
    // Callback should be called
    expect(onModalCloseMock).toHaveBeenCalledTimes(1);
  });
});