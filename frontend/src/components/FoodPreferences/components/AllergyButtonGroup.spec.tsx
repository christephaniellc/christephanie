import React from 'react';
import { render, screen } from '@testing-library/react';
import AllergyButtonGroup from './AllergyButtonGroup';
import { RecoilRoot } from 'recoil';
import { ThemeProvider, createTheme } from '@mui/material';
import { FoodAllergyIconProps } from '@/components/Allergies';
import { SetMeal, Spa } from '@mui/icons-material';

// Mock dependencies
jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => ({
    screenWidth: 1200, // Desktop view
  }),
}));

jest.mock('@/store/family', () => ({
  useFamily: () => [
    null,
    {
      patchFamilyGuestMutation: { status: 'idle' },
      getFamilyUnitQuery: { isFetching: false },
    },
  ],
  guestSelector: () => () => ({
    guestId: 'test-guest-id',
    preferences: {
      foodAllergies: ['Peanut', 'CustomAllergy'],
    },
  }),
}));

describe('AllergyButtonGroup', () => {
  const mockTheme = createTheme();
  
  const mockAllergyIconProps: FoodAllergyIconProps[] = [
    { allergyName: 'Peanut', icon: Spa, selected: true },
    { allergyName: 'Fish', icon: SetMeal, selected: false },
  ];
  
  const defaultProps = {
    guestId: 'test-guest-id',
    chosenAllergies: ['Peanut', 'CustomAllergy'],
    activeEatingIcon: <div data-testid="active-eating-icon" />,
    resetAllergies: jest.fn(),
    allergyIconProps: mockAllergyIconProps,
    setModalOpen: jest.fn(),
  };
  
  const renderComponent = (props = {}) => {
    return render(
      <RecoilRoot>
        <ThemeProvider theme={mockTheme}>
          <AllergyButtonGroup {...defaultProps} {...props} />
        </ThemeProvider>
      </RecoilRoot>
    );
  };
  
  it('should display standard allergies [ wip]', () => {
    renderComponent();
    
    // Should show the allergy chip for a standard allergy
    expect(screen.getByText('Peanut')).toBeInTheDocument();
  });
  
  it('should display custom allergies [ wip]', () => {
    renderComponent();
    
    // Should show the custom allergy chip
    expect(screen.getByText('CustomAllergy')).toBeInTheDocument();
  });
  
  it('should show "I can eat anything" when no allergies are selected [ wip]', () => {
    renderComponent({
      chosenAllergies: ['none'],
    });
    
    expect(screen.getByText('I can eat anything')).toBeInTheDocument();
    expect(screen.queryByText('Peanut')).not.toBeInTheDocument();
    expect(screen.queryByText('CustomAllergy')).not.toBeInTheDocument();
  });
  
  it('should show "I\'m allergic to stuff" button when no allergies are selected [ wip]', () => {
    renderComponent({
      chosenAllergies: ['none'],
    });
    
    expect(screen.getByText('I\'m allergic to stuff')).toBeInTheDocument();
  });
});