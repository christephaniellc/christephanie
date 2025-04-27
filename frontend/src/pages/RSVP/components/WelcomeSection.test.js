import React from 'react';
import { render } from '@testing-library/react';
import { RsvpEnum } from '@/types/api';

// Mock the updateFamilyGuestRsvp function
const mockUpdateFamilyGuestRsvp = jest.fn();

// Mock modules before importing the component
jest.mock('@/store/family', () => ({
  useFamily: () => {
    const mockFamily = {
      guests: [
        {
          guestId: 'guest-1',
          firstName: 'John',
          rsvp: { wedding: RsvpEnum.Pending },
        },
      ],
    };

    const mockFamilyActions = {
      getFamily: jest.fn(),
      updateFamilyGuestRsvp: mockUpdateFamilyGuestRsvp,
      patchFamilyGuestMutation: { status: 'idle', isPending: false },
      getFamilyUnitQuery: { isFetching: false },
    };

    return [mockFamily, mockFamilyActions];
  },
}));

// Mock Material UI components
jest.mock('@mui/material', () => {
  return {
    Box: ({ children }) => <div>{children}</div>,
    Typography: ({ children }) => <div>{children}</div>,
    Card: ({ children }) => <div>{children}</div>,
    CardContent: ({ children }) => <div>{children}</div>,
    List: ({ children }) => <ul>{children}</ul>,
    ListItem: ({ children }) => <li>{children}</li>,
    Button: (props) => <button onClick={props.onClick}>{props.children}</button>,
    CircularProgress: () => <div data-testid="loading-indicator" />,
    useTheme: () => ({
      palette: {
        primary: { main: '#000' },
        secondary: { main: '#000' },
        error: { main: '#000' },
        success: { main: '#000' },
        warning: { main: '#000' },
        text: { primary: '#000', secondary: '#000' },
        divider: '#000',
      },
      breakpoints: {
        down: () => false,
        up: () => false,
        values: { sm: 600, md: 960 },
      },
      spacing: (n) => n * 8,
    }),
    useMediaQuery: () => false,
    alpha: () => 'rgba(0,0,0,0.5)',
    darken: () => '#000',
    styled: (Component) => Component,
    keyframes: () => 'keyframes',
  };
});

// Mock styled components
jest.mock('@/components/AttendanceButton/components/StyledComponents', () => ({
  StephsActualFavoriteTypographyNoDrop: ({ children }) => <div>{children}</div>,
  StephsStyledTypography: ({ children }) => <div>{children}</div>,
}));

// Mock context
jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => ({ screenWidth: 1000 }),
}));

// Mock hooks
jest.mock('@/hooks/useBoxShadow', () => ({
  useBoxShadow: () => ({ boxShadow: '0 0 0' }),
}));

// Mock icons
jest.mock('@mui/icons-material', () => ({
  CheckCircle: () => <div data-testid="check-icon" />,
  Cancel: () => <div data-testid="cancel-icon" />,
  Celebration: () => <div data-testid="celebration-icon" />,
  EventAvailable: () => <div data-testid="event-icon" />,
  FavoriteBorder: () => <div data-testid="favorite-border-icon" />,
  Favorite: () => <div data-testid="favorite-icon" />,
}));

// Mock styled components
jest.mock('@emotion/styled', () => (component) => component);
jest.mock('@emotion/react', () => ({ keyframes: () => 'animation' }));

// Now import the component after all mocks are set up
const WelcomeSection = require('./WelcomeSection').WelcomeSection;

describe('WelcomeSection', () => {
  beforeEach(() => {
    // Clear mock function calls
    jest.clearAllMocks();
  });

  it('should always set RSVP status to Pending regardless of which button is clicked', () => {
    // Render the component
    const { container } = render(<WelcomeSection />);
    
    // Find all buttons - we know the first two buttons are the attendance buttons
    const buttons = container.querySelectorAll('button');
    
    // Click "I'll be there" button (first button)
    buttons[0].click();
    
    // Verify it called updateFamilyGuestRsvp with Pending
    expect(mockUpdateFamilyGuestRsvp).toHaveBeenCalledWith('guest-1', RsvpEnum.Pending);
    
    // Clear mock calls
    mockUpdateFamilyGuestRsvp.mockClear();
    
    // Click "Cannot attend" button (second button)
    buttons[1].click();
    
    // Verify it also called updateFamilyGuestRsvp with Pending
    expect(mockUpdateFamilyGuestRsvp).toHaveBeenCalledWith('guest-1', RsvpEnum.Pending);
  });
});