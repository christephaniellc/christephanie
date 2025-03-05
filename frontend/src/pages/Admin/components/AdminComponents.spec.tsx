import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RsvpEnum, FoodPreferenceEnum, SleepPreferenceEnum, AgeGroupEnum, RoleEnum } from '@/types/api';
import { getRsvpStatusColor, getFoodPreferenceDetails, getSleepPreferenceDetails } from './AdminHelpers';
import GuestStatusItem from './GuestStatusItem';
import GuestDetailCard from './GuestDetailCard';
import FamilyCard from './FamilyCard';

// Mock React for createContext
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createContext: jest.fn().mockReturnValue({
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

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
    wedding: RsvpEnum.Attending
  },
  preferences: {
    foodPreference: FoodPreferenceEnum.Omnivore,
    sleepPreference: SleepPreferenceEnum.Camping,
    foodAllergies: ['Nuts', 'Dairy'],
    notificationPreference: ['Email', 'SMS']
  }
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
        wedding: RsvpEnum.Attending
      }
    },
    { 
      firstName: 'Jane', 
      lastName: 'Smith',
      guestId: '456',
      roles: [RoleEnum.Guest],
      ageGroup: AgeGroupEnum.Adult,
      rsvp: {
        wedding: RsvpEnum.Pending
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

describe('Admin Helper Functions.wip', () => {
  it('should return correct color for RSVP status.wip', () => {
    expect(getRsvpStatusColor(RsvpEnum.Attending)).toBe('success.main');
    expect(getRsvpStatusColor(RsvpEnum.Declined)).toBe('error.main');
    expect(getRsvpStatusColor(RsvpEnum.Pending)).toBe('warning.main');
    expect(getRsvpStatusColor(undefined)).toBe('warning.main');
  });

  it('should return correct details for food preferences.wip', () => {
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

  it('should return correct details for sleep preferences.wip', () => {
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
});

describe('GuestStatusItem.wip', () => {
  it('should render guest information.wip', () => {
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
    expect(screen.getByText('Wedding')).toBeInTheDocument();
  });
});

describe('GuestDetailCard.wip', () => {
  it('should render guest details when not flipped.wip', () => {
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

  // We can't easily test the flipped state because of the way 3D transforms work in jsdom
});

describe('FamilyCard.wip', () => {
  it('should render family information.wip', () => {
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
    
    // Guest names
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    
    // Address
    expect(screen.getByText('Mailing Address')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Anytown, CA 12345')).toBeInTheDocument();
    
    // Last login
    expect(screen.getByText('Last Activity')).toBeInTheDocument();
    expect(screen.getByText(/January 1, 2023/)).toBeInTheDocument();
  });
});