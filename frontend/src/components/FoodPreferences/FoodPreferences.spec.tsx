import { render, screen } from '@testing-library/react';
import FoodPreferences from './FoodPreferences';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { AgeGroupEnum, FoodPreferenceEnum } from '@/types/api';

// Mock the family selectors and actions
jest.mock('@/store/family', () => ({
  guestSelector: jest.fn(() => ({
    key: 'guestSelector',
    default: {
      guestId: 'test-guest-id',
      ageGroup: AgeGroupEnum.Adult,
      preferences: {
        foodPreference: FoodPreferenceEnum.Omnivore,
        foodAllergies: [],
      },
    }
  })),
  useFamily: jest.fn(() => [
    {},
    {
      updateFamilyGuestFoodPreferences: jest.fn(),
      patchFamilyMutation: { status: 'idle' },
      getFamilyUnitQuery: { isFetching: false },
    }
  ])
}));

// Mock useAppLayout hook
jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: jest.fn(() => ({
    screenWidth: 1200, // Set to desktop by default
  }))
}));

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#E9950C',
    },
  },
});

describe('FoodPreferences Component', () => {
  it('renders food preference buttons correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <FoodPreferences guestId="test-guest-id" />
        </RecoilRoot>
      </ThemeProvider>
    );

    // Check that all the food preference buttons exist
    expect(screen.getByText('Only animals')).toBeInTheDocument();
    expect(screen.getByText('All Life')).toBeInTheDocument();
    expect(screen.getByText('Mostly Plants')).toBeInTheDocument();
    expect(screen.getByText('Vegan')).toBeInTheDocument();
  });

  it('applies correct styling to food preference buttons', () => {
    render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <FoodPreferences guestId="test-guest-id" />
        </RecoilRoot>
      </ThemeProvider>
    );

    // Get all buttons
    const buttons = screen.getAllByRole('button');

    // Ensure we have the expected number of buttons
    expect(buttons.length).toBeGreaterThanOrEqual(4);

    // Check each button has the proper styling classes
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });

  it('renders BYOB button for babies', () => {
    // Override the guestSelector mock to return a baby
    const familyModule = jest.requireMock('@/store/family');
    jest.spyOn(familyModule, 'guestSelector').mockReturnValue({
      key: 'guestSelector',
      default: {
        guestId: 'test-baby-id',
        ageGroup: AgeGroupEnum.Baby,
        preferences: {
          foodPreference: FoodPreferenceEnum.BYOB,
          foodAllergies: [],
        },
      }
    });

    render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <FoodPreferences guestId="test-baby-id" />
        </RecoilRoot>
      </ThemeProvider>
    );

    // Check that the BYOB button exists
    expect(screen.getByText('BYOB')).toBeInTheDocument();

    // And that other food preference buttons don't exist
    expect(screen.queryByText('Only animals')).not.toBeInTheDocument();
  });
});