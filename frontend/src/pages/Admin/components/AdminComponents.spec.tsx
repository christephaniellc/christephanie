import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  RsvpEnum, 
  FoodPreferenceEnum, 
  SleepPreferenceEnum, 
  AgeGroupEnum, 
  RoleEnum,
  InvitationResponseEnum,
  NotificationPreferenceEnum
} from '@/types/api';
import { 
  getRsvpStatusColor, 
  getInvitationStatusColor,
  getInvitationStatusIcon,
  getFoodPreferenceDetails, 
  getSleepPreferenceDetails,
  getFamilyStatusColor
} from './AdminHelpers';
import GuestStatusItem from './GuestStatusItem';
import GuestDetailCard from './GuestDetailCard';
import FamilyCard from './FamilyCard';

// Mock React for createContext - simpler approach
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  const mockProvider = ({ children }: { children: React.ReactNode }) => children;
  const mockConsumer = ({ children }: { children: React.ReactNode }) => children;
  
  return {
    ...originalReact,
    createContext: jest.fn().mockImplementation(() => ({
      Provider: mockProvider,
      Consumer: mockConsumer
    }))
  };
});

// Mock the useAppLayout hook
jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: jest.fn().mockReturnValue({
    contentHeight: 400,
    screenWidth: 1200,
  }),
}));

// Mock the themePaletteToRgba function
jest.mock('@/components/AttendanceButton/AttendanceButton', () => ({
  themePaletteToRgba: jest.fn().mockReturnValue('rgba(0,0,0,0.1)'),
  StephsActualFavoriteTypography: jest.requireActual('@mui/material').Typography,
}));

const theme = createTheme();

const mockGuest = {
  guestId: '123',
  firstName: 'John',
  lastName: 'Doe',
  ageGroup: AgeGroupEnum.Adult,
  rsvp: {
    invitationResponse: InvitationResponseEnum.Interested
  },
  preferences: {
    foodPreference: FoodPreferenceEnum.Omnivore,
    sleepPreference: SleepPreferenceEnum.Camping,
    foodAllergies: ['Nuts', 'Dairy'],
    notificationPreference: [NotificationPreferenceEnum.Email, NotificationPreferenceEnum.Text]
  },
  roles: [RoleEnum.Guest] // Add required roles property
};

const mockFamily = {
  invitationCode: 'ABC123',
  unitName: 'Smith Family',
  guests: [
    { 
      firstName: 'John', 
      lastName: 'Smith',
      guestId: '123',
      roles: [RoleEnum.Guest],
      ageGroup: AgeGroupEnum.Adult,
      rsvp: {
        invitationResponse: InvitationResponseEnum.Interested
      }
    },
    { 
      firstName: 'Jane', 
      lastName: 'Smith',
      guestId: '456',
      roles: [RoleEnum.Guest],
      ageGroup: AgeGroupEnum.Adult,
      rsvp: {
        invitationResponse: InvitationResponseEnum.Pending
      }
    }
  ],
  mailingAddress: {
    streetAddress: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postalCode: '12345'
  },
  familyUnitLastLogin: '2023-01-01T12:00:00Z'
};

describe('Admin Helper Functions.locked', () => {
  it('should return correct color for RSVP status.locked', () => {
    expect(getRsvpStatusColor(RsvpEnum.Attending)).toBe('success.main');
    expect(getRsvpStatusColor(RsvpEnum.Declined)).toBe('error.main');
    expect(getRsvpStatusColor(RsvpEnum.Pending)).toBe('warning.main');
    expect(getRsvpStatusColor(undefined)).toBe('warning.main');
  });

  it('should return correct color for Invitation status.wip', () => {
    expect(getInvitationStatusColor(InvitationResponseEnum.Interested)).toBe('success.main');
    expect(getInvitationStatusColor(InvitationResponseEnum.Declined)).toBe('error.main');
    expect(getInvitationStatusColor(InvitationResponseEnum.Pending)).toBe('warning.main');
    expect(getInvitationStatusColor(undefined)).toBe('warning.main');
  });

  it('should return correct details for food preferences.locked', () => {
    const omnivore = getFoodPreferenceDetails(FoodPreferenceEnum.Omnivore);
    expect(omnivore.label).toBe('Omnivore');
    expect(omnivore.color).toBe('#9c27b0');

    const vegetarian = getFoodPreferenceDetails(FoodPreferenceEnum.Vegetarian);
    expect(vegetarian.label).toBe('Vegetarian');
    expect(vegetarian.color).toBe('#4caf50');

    const unknown = getFoodPreferenceDetails(undefined);
    expect(unknown.label).toBe('Unknown');
    expect(unknown.color).toBe('#9e9e9e');
  });

  it('should return correct details for sleep preferences.locked', () => {
    const camping = getSleepPreferenceDetails(SleepPreferenceEnum.Camping);
    expect(camping.label).toBe('Camping');
    expect(camping.color).toBe('#388e3c');

    const hotel = getSleepPreferenceDetails(SleepPreferenceEnum.Hotel);
    expect(hotel.label).toBe('Hotel');
    expect(hotel.color).toBe('#1976d2');

    const unknown = getSleepPreferenceDetails(undefined);
    expect(unknown.label).toBe('Unknown');
    expect(unknown.color).toBe('#9e9e9e');
  });
  
  it('should determine family status color correctly based on invitation responses.wip', () => {
    // Family with all members pending
    const pendingFamily = {
      ...mockFamily,
      guests: [
        { 
          ...mockGuest, 
          rsvp: { invitationResponse: InvitationResponseEnum.Pending }
        },
        { 
          ...mockGuest, 
          guestId: '456',
          rsvp: { invitationResponse: InvitationResponseEnum.Pending }
        }
      ]
    };
    expect(getFamilyStatusColor(pendingFamily)).toBe('warning.light');
    
    // Family with some interested members
    const interestedFamily = {
      ...mockFamily,
      guests: [
        { 
          ...mockGuest, 
          rsvp: { invitationResponse: InvitationResponseEnum.Interested }
        },
        { 
          ...mockGuest, 
          guestId: '456',
          rsvp: { invitationResponse: InvitationResponseEnum.Pending }
        }
      ]
    };
    expect(getFamilyStatusColor(interestedFamily)).toBe('success.light');
    
    // Family with all declined members
    const declinedFamily = {
      ...mockFamily,
      guests: [
        { 
          ...mockGuest, 
          rsvp: { invitationResponse: InvitationResponseEnum.Declined }
        },
        { 
          ...mockGuest, 
          guestId: '456',
          rsvp: { invitationResponse: InvitationResponseEnum.Declined }
        }
      ]
    };
    expect(getFamilyStatusColor(declinedFamily)).toBe('error.light');
    
    // Mixed family (some declined, some interested)
    const mixedFamily = {
      ...mockFamily,
      guests: [
        { 
          ...mockGuest, 
          rsvp: { invitationResponse: InvitationResponseEnum.Interested }
        },
        { 
          ...mockGuest, 
          guestId: '456',
          rsvp: { invitationResponse: InvitationResponseEnum.Declined }
        }
      ]
    };
    expect(getFamilyStatusColor(mixedFamily)).toBe('success.light');
  });
});

describe('GuestStatusItem Component.wip', () => {
  it('should render standard guest information with InvitationResponseEnum status.wip', () => {
    const handleClick = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <GuestStatusItem 
          guest={mockGuest} 
          onClick={handleClick}
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByTestId('guest-status-item')).toBeInTheDocument();
  });
  
  it('should render compact avatar version when compact prop is true.wip', () => {
    const handleClick = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <GuestStatusItem 
          guest={mockGuest} 
          onClick={handleClick}
          compact={true}
        />
      </ThemeProvider>
    );
    
    // Should render just the avatar, not the full element
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    
    // Check the avatar has the correct initials
    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });
  
  it('should call onClick handler when clicked.wip', () => {
    const handleClick = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <GuestStatusItem 
          guest={mockGuest} 
          onClick={handleClick}
        />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByTestId('guest-status-item'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(expect.anything(), '123');
  });
});

describe('GuestDetailCard.locked', () => {
  it('should render guest details when not flipped.locked', () => {
    render(
      <ThemeProvider theme={theme}>
        <GuestDetailCard 
          guest={mockGuest} 
          flipped={false}
          flipAxis="Y"
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Adult')).toBeInTheDocument();
    expect(screen.getByText('Food Preference')).toBeInTheDocument();
    expect(screen.getByText('Omnivore')).toBeInTheDocument();
    expect(screen.getByText('Allergies')).toBeInTheDocument();
    expect(screen.getByText('Nuts')).toBeInTheDocument();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Accommodation')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('SMS')).toBeInTheDocument();
  });
});

describe('FamilyCard.wip', () => {
  it('should render family card in collapsed state by default.wip', () => {
    const handleGuestClick = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <FamilyCard 
          family={mockFamily} 
          onGuestClick={handleGuestClick}
        />
      </ThemeProvider>
    );
    
    // Family name and invitation code
    expect(screen.getByText('Smith Family')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    
    // Should show avatar group in collapsed state
    expect(screen.getByTestId('family-card-avatars')).toBeInTheDocument();
    
    // Should not show detailed content in collapsed state
    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
  });
  
  it('should expand when clicking the expand button.wip', () => {
    const handleGuestClick = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <FamilyCard 
          family={mockFamily} 
          onGuestClick={handleGuestClick}
        />
      </ThemeProvider>
    );
    
    // Click expand button
    fireEvent.click(screen.getByTestId('expand-button'));
    
    // Should now show address and other details
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Anytown, CA 12345')).toBeInTheDocument();
    expect(screen.getByText('Last Activity')).toBeInTheDocument();
    expect(screen.getByText(/January 1, 2023/)).toBeInTheDocument();
    
    // Should show full guest items
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    
    // Should hide avatar group in expanded state
    expect(screen.queryByTestId('family-card-avatars')).not.toBeInTheDocument();
  });
  
  it('should collapse when clicking the button again.wip', () => {
    const handleGuestClick = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <FamilyCard 
          family={mockFamily} 
          onGuestClick={handleGuestClick}
        />
      </ThemeProvider>
    );
    
    // Click expand button
    fireEvent.click(screen.getByTestId('expand-button'));
    
    // Click again to collapse
    fireEvent.click(screen.getByTestId('expand-button'));
    
    // Should hide detailed content again
    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
    
    // Should show avatars again
    expect(screen.getByTestId('family-card-avatars')).toBeInTheDocument();
  });
});