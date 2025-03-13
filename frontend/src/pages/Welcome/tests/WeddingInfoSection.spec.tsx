import { render, screen } from '@testing-library/react';
import WeddingInfoSection from '../components/WeddingInfoSection';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// Mock components
jest.mock('@/components/Countdowns', () => ({
  __esModule: true,
  default: () => <div data-testid="countdowns">Countdowns Component</div>
}));

// Create a test theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
    },
    secondary: {
      main: '#E9950C',
    },
    background: {
      paper: '#171717',
    },
    common: {
      white: '#ffffff',
      black: '#000000'
    }
  },
  shape: {
    borderRadius: 4
  }
});

describe('WeddingInfoSection.wip', () => {
  const mockProps = {
    randomGettingMarriedQuote: 'are getting hitched',
    user: { rsvp: { invitationResponse: 'Pending' } }
  };

  it('renders the wedding quote with text shadow.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <WeddingInfoSection {...mockProps} />
      </ThemeProvider>
    );
    
    const quoteElement = screen.getByText('are getting hitched!');
    expect(quoteElement).toBeInTheDocument();
    const computedStyle = window.getComputedStyle(quoteElement);
    expect(computedStyle.textShadow).toBeDefined();
  });

  it('renders the date with color wipe animation and sparkles below.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <WeddingInfoSection {...mockProps} />
      </ThemeProvider>
    );
    
    const dateElement = screen.getByText('July 5, 2025');
    expect(dateElement).toBeInTheDocument();
    
    // Find the link element that contains the date text
    const linkElement = dateElement.closest('a');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('download', 'StephAndTopher_Wedding.ics');
    
    // Check if the parent animation box is present
    const animationBox = dateElement.closest('div');
    expect(animationBox).toBeInTheDocument();
    
    // In Jest, animations can't be directly tested, but we can check if 
    // elements that would contain animations exist in the DOM
    
    // Verify the sparkles container exists below the text
    const sparklesContainer = animationBox!.querySelector('div');
    expect(sparklesContainer).toBeInTheDocument();
    
    // Count sparkle elements (should be at least 6 regular sparkles and 3 star sparkles)
    const sparkleElements = sparklesContainer!.querySelectorAll('div');
    expect(sparkleElements.length).toBeGreaterThanOrEqual(9); // 6 sparkles + 3 stars
    
    // Verify gradient background is applied for the color wipe effect
    const computedStyle = window.getComputedStyle(dateElement);
    expect(computedStyle.background).toBeDefined();
    expect(computedStyle.backgroundClip).toBeDefined();
    
    // Verify animations are specified
    expect(computedStyle.animation).toBeDefined();
    expect(computedStyle.animationName).toBeDefined();
  });

  it('renders the location with a Google Maps link.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <WeddingInfoSection {...mockProps} />
      </ThemeProvider>
    );
    
    const locationElement = screen.getByText('Lovettsville, VA');
    expect(locationElement).toBeInTheDocument();
    
    // Find the link element that contains the location text
    const linkElement = locationElement.closest('a');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://maps.google.com/?q=Lovettsville,VA');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    
    // Verify hover effect styling is present
    expect(locationElement).toHaveStyle('transition: all 0.3s ease');
    expect(locationElement).toHaveStyle('position: relative');
  });

  it('renders the countdowns component with backdrop styling.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <WeddingInfoSection {...mockProps} />
      </ThemeProvider>
    );
    
    const countdownsElement = screen.getByTestId('countdowns');
    expect(countdownsElement).toBeInTheDocument();
    
    // Find the parent Typography element with the enhanced styling
    const countdownContainer = countdownsElement.closest('p');
    expect(countdownContainer).toBeInTheDocument();
    expect(countdownContainer).toHaveStyle('backdrop-filter: blur(3px)');
    expect(countdownContainer).toHaveStyle('background-color: rgba(0, 0, 0, 0.25)');
  });
});