import React from 'react';
import { render } from '@testing-library/react';
import { WelcomeSection } from './WelcomeSection';
import { RsvpEnum } from '@/types/api';

// Mock the updateFamilyGuestRsvp function
const mockUpdateFamilyGuestRsvp = jest.fn();

// Mock the useFamily hook
jest.mock('@/store/family', () => ({
  useFamily: () => {
    // Create a mock for family data
    const mockFamily = {
      guests: [
        {
          guestId: 'guest-1',
          firstName: 'John',
          lastName: 'Doe',
          rsvp: {
            wedding: RsvpEnum.Pending,
          },
        },
      ],
    };

    // Create a mock for familyActions with our mocked function
    const mockFamilyActions = {
      getFamily: jest.fn(),
      updateFamilyGuestRsvp: mockUpdateFamilyGuestRsvp,
      patchFamilyGuestMutation: {
        status: 'idle',
        isPending: false,
      },
      getFamilyUnitQuery: { isFetching: false },
    };

    return [mockFamily, mockFamilyActions];
  },
}));

// Create mock components to avoid dependency issues
jest.mock('@mui/material', () => {
  return {
    Box: ({ children }) => <div data-testid="mui-box">{children}</div>,
    Typography: ({ children }) => <div data-testid="mui-typography">{children}</div>,
    Card: ({ children }) => <div data-testid="mui-card">{children}</div>,
    CardContent: ({ children }) => <div data-testid="mui-card-content">{children}</div>,
    List: ({ children }) => <ul data-testid="mui-list">{children}</ul>,
    ListItem: ({ children }) => <li data-testid="mui-list-item">{children}</li>,
    Button: (props) => <button data-testid="mui-button" onClick={props.onClick}>{props.children}</button>,
    CircularProgress: () => <div data-testid="mui-circular-progress" />,
    alpha: () => 'rgba(0,0,0,0.5)',
    darken: () => '#000',
    useTheme: () => ({
      palette: {
        primary: { main: '#3f51b5' },
        secondary: { main: '#f50057' },
        error: { main: '#f44336' },
        warning: { main: '#ff9800' },
        success: { main: '#4caf50' },
        text: { primary: '#000000', secondary: '#757575' },
        divider: '#e0e0e0',
        grey: { A700: '#616161' },
        common: { white: '#ffffff', black: '#000000' },
      },
      breakpoints: {
        down: () => false,
        up: () => false,
        values: { sm: 600, md: 960 },
      },
      spacing: (n) => n * 8,
      shape: { borderRadius: 4 },
      transitions: {
        create: () => 'all 0.3s ease',
        duration: { standard: 300 },
      },
    }),
    useMediaQuery: () => false,
    keyframes: () => 'animation-keyframes',
    styled: (Component) => Component,
  };
});

// Mock styled components
jest.mock('@/components/AttendanceButton/components/StyledComponents', () => ({
  StephsActualFavoriteTypographyNoDrop: ({ children }) => <div data-testid="styled-typography-no-drop">{children}</div>,
  StephsStyledTypography: ({ children }) => <div data-testid="styled-typography">{children}</div>,
}));

// Mock context
jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => ({ screenWidth: 1024 }),
}));

// Mock hooks
jest.mock('@/hooks/useBoxShadow', () => ({
  useBoxShadow: () => ({ boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }),
}));

// Mock icons
jest.mock('@mui/icons-material', () => ({
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Cancel: () => <div data-testid="cancel-icon" />,
  Celebration: () => <div data-testid="celebration-icon" />,
  EventAvailable: () => <div data-testid="event-available-icon" />,
  FavoriteBorder: () => <div data-testid="favorite-border-icon" />,
  Favorite: () => <div data-testid="favorite-icon" />,
}));

// Mock styled components
jest.mock('@emotion/styled', () => ({
  default: (Component) => Component,
}));

// Mock emotion
jest.mock('@emotion/react', () => ({
  keyframes: () => 'animation-keyframes',
}));

describe('WelcomeSection Component', () => {
  beforeEach(() => {
    // Clear mock function calls
    jest.clearAllMocks();
  });

  it('should validate that handleResponseChange always sets RSVP status to Pending', () => {
    // Render the component
    const { getAllByTestId } = render(<WelcomeSection />);
    
    // Find all buttons and get the first two which are our attendance buttons
    const buttons = getAllByTestId('mui-button');
    
    // First button should be "I'll be there"
    buttons[0].click();
    
    // Verify that updateFamilyGuestRsvp was called with Pending (not Attending)
    expect(mockUpdateFamilyGuestRsvp).toHaveBeenCalledWith('guest-1', RsvpEnum.Pending);
    expect(mockUpdateFamilyGuestRsvp).not.toHaveBeenCalledWith('guest-1', RsvpEnum.Attending);
    
    // Clear the mock function
    mockUpdateFamilyGuestRsvp.mockClear();
    
    // Second button should be "Cannot attend"
    buttons[1].click();
    
    // Verify that updateFamilyGuestRsvp was called with Pending (not Declined)
    expect(mockUpdateFamilyGuestRsvp).toHaveBeenCalledWith('guest-1', RsvpEnum.Pending);
    expect(mockUpdateFamilyGuestRsvp).not.toHaveBeenCalledWith('guest-1', RsvpEnum.Declined);
  });
});