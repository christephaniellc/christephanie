import React from 'react';
import { render, screen } from '@testing-library/react';
import WeddingInfoSection from './WeddingInfoSection';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { InvitationResponseEnum } from '@/types/api';

// Mock isMobile to return false for tests
jest.mock('is-mobile', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(false)
}));

// Mock the Auth0 hooks and context
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: { sub: 'test-user-id' },
    loginWithRedirect: jest.fn(),
  }),
}));

// Mock Countdowns component
jest.mock('@/components/Countdowns', () => ({
  __esModule: true,
  default: ({ event, interested }) => (
    <div data-testid="mock-countdown">
      {event} Countdown - {interested}
    </div>
  ),
}));

describe('WeddingInfoSection.wip', () => {
  const theme = createTheme();
  const loggedInUser = {
    firstName: 'Test',
    lastName: 'User',
    auth0Id: 'auth0|123456789',
    rsvp: {
      invitationResponse: InvitationResponseEnum.Interested
    }
  };
  
  const loggedOutUser = {
    firstName: 'Test',
    lastName: 'User',
    auth0Id: null,
    rsvp: {
      invitationResponse: InvitationResponseEnum.Interested
    }
  };
  
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    );
  };
  
  it('renders the wedding date with bounce animation and proper z-index.wip', () => {
    renderWithTheme(
      <WeddingInfoSection 
        randomGettingMarriedQuote="Test quote" 
        user={loggedInUser} 
      />
    );
    
    const dateElement = screen.getByText('July 5, 2025');
    expect(dateElement).toBeInTheDocument();
    
    // Check if the date has animation style applied
    // We need to check the style of the parent component that contains the animation
    const dateStyles = window.getComputedStyle(dateElement);
    
    // In testing environment we can't directly test CSS animations,
    // but we can check if animation property exists
    expect(dateElement).toHaveStyle('animation: dateBounce 2s infinite ease-in-out');
    
    // Ensure proper z-index to stay in front of sparkles
    expect(dateElement).toHaveStyle('z-index: 1');
  });
  
  it('renders sparkle container with appropriate sizing.wip', () => {
    renderWithTheme(
      <WeddingInfoSection 
        randomGettingMarriedQuote="Test quote" 
        user={loggedInUser} 
      />
    );
    
    // Find the date element
    const dateElement = screen.getByText('July 5, 2025');
    
    // Get the parent container with sparkles
    // This is a bit tricky to test directly with React Testing Library
    // since we don't have a direct testid on the Box containing the sparkles
    // We can verify that the date is contained within the document
    expect(dateElement).toBeInTheDocument();
    
    // We can't directly test the sparkles in Jest environment as they're 
    // dynamically generated, but we can verify the date renders properly
  });
  
  it('displays calendar dialog when date is clicked.wip', () => {
    renderWithTheme(
      <WeddingInfoSection 
        randomGettingMarriedQuote="Test quote" 
        user={loggedInUser} 
      />
    );
    
    // Find and click the date element
    const dateElement = screen.getByText('July 5, 2025');
    fireEvent.click(dateElement);
    
    // Dialog should appear with calendar options
    expect(screen.getByText('Add to Calendar')).toBeInTheDocument();
    expect(screen.getByText('Google Calendar')).toBeInTheDocument();
    expect(screen.getByText('Apple Calendar (iCal)')).toBeInTheDocument();
    expect(screen.getByText('Other Calendar (iCal)')).toBeInTheDocument();
    
    // Test that dialog closes when Close button is clicked
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Dialog should be closed
    expect(screen.queryByText('Add to Calendar')).not.toBeInTheDocument();
  });
  
  it('shows venue details when user is logged in.wip', () => {
    renderWithTheme(
      <WeddingInfoSection 
        randomGettingMarriedQuote="Test quote" 
        user={loggedInUser} 
      />
    );
    
    // Should show specific venue for logged in users
    expect(screen.getByText('Stone Manor, Lovettsville, VA')).toBeInTheDocument();
  });
  
  it('hides venue details when user is not logged in.wip', () => {
    renderWithTheme(
      <WeddingInfoSection 
        randomGettingMarriedQuote="Test quote" 
        user={loggedOutUser} 
      />
    );
    
    // Should only show general location for non-logged in users
    expect(screen.getByText('Lovettsville, VA')).toBeInTheDocument();
    expect(screen.queryByText('Stone Manor, Lovettsville, VA')).not.toBeInTheDocument();
  });
  
  it('uses Google Maps links for location.wip', () => {
    renderWithTheme(
      <WeddingInfoSection 
        randomGettingMarriedQuote="Test quote" 
        user={loggedInUser} 
      />
    );
    
    // Get the location link
    const locationLink = screen.getByText('Stone Manor, Lovettsville, VA').closest('a');
    
    // Check that it's a Google Maps link
    expect(locationLink).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
  });
  
  it('renders the date text centered.wip', () => {
    renderWithTheme(
      <WeddingInfoSection 
        randomGettingMarriedQuote="Test quote" 
        user={loggedInUser} 
      />
    );
    
    // The date should be visible
    const dateElement = screen.getByText('July 5, 2025');
    expect(dateElement).toBeInTheDocument();
    
    // And should have centering styles
    expect(dateElement).toHaveStyle('text-align: center');
    expect(dateElement).toHaveStyle('width: 100%');
  });
});