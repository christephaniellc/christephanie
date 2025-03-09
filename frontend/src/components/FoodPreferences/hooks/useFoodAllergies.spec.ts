import { renderHook, act } from '@testing-library/react-hooks';
import { RecoilRoot } from 'recoil';
import { useFoodAllergies } from './useFoodAllergies';
import { seriousFoodAllergies, getIconForCustomAllergy } from '@/components/Allergies';
import { guestSelector, useFamily } from '@/store/family';
import { createWrapper } from 'react-dom/test-utils';

// Mock dependencies
jest.mock('@/store/family', () => ({
  guestSelector: jest.fn(),
  useFamily: jest.fn(),
}));

jest.mock('@/components/Allergies', () => {
  const originalModule = jest.requireActual('@/components/Allergies');
  return {
    ...originalModule,
    getIconForCustomAllergy: jest.fn().mockImplementation(() => 'MockIcon'),
    seriousFoodAllergies: [
      { allergyName: 'Peanut', icon: 'MockIcon', selected: false },
      { allergyName: 'Milk', icon: 'MockIcon', selected: false },
      { allergyName: 'Wheat', icon: 'MockIcon', selected: false },
    ],
  };
});

describe('useFoodAllergies', () => {
  const mockGuestId = 'guest-123';
  const mockUpdateFamilyGuestFoodAllergies = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock guest data
    (guestSelector as jest.Mock).mockReturnValue(() => ({
      guestId: mockGuestId,
      preferences: {
        foodAllergies: ['Peanut', 'CustomAllergy1']
      }
    }));
    
    // Mock family actions
    (useFamily as jest.Mock).mockReturnValue([
      null, 
      { 
        updateFamilyGuestFoodAllergies: mockUpdateFamilyGuestFoodAllergies
      }
    ]);
  });
  
  it('should identify and handle custom allergies [ wip]', () => {
    const wrapper = ({ children }) => <RecoilRoot>{children}</RecoilRoot>;
    
    const { result } = renderHook(() => useFoodAllergies(mockGuestId), { wrapper });
    
    // With our mock, 'CustomAllergy1' should be identified as a custom allergy
    expect(result.current.customAllergies).toContain('CustomAllergy1');
    expect(result.current.customAllergies).not.toContain('Peanut');
  });
  
  it('should add a new custom allergy to the list [ wip]', () => {
    const wrapper = ({ children }) => <RecoilRoot>{children}</RecoilRoot>;
    
    const { result } = renderHook(() => useFoodAllergies(mockGuestId), { wrapper });
    
    act(() => {
      result.current.handleGuestFoodAllergy('NewCustomAllergy');
    });
    
    // Check that updateFamilyGuestFoodAllergies was called with the new allergy included
    expect(mockUpdateFamilyGuestFoodAllergies).toHaveBeenCalledWith(
      mockGuestId,
      expect.arrayContaining(['NewCustomAllergy'])
    );
  });
  
  it('should generate an icon for custom allergies [ wip]', () => {
    // Mock the guest to have a custom allergy
    (guestSelector as jest.Mock).mockReturnValue(() => ({
      guestId: mockGuestId,
      preferences: {
        foodAllergies: ['CustomAllergy1']
      }
    }));
    
    const wrapper = ({ children }) => <RecoilRoot>{children}</RecoilRoot>;
    const { result } = renderHook(() => useFoodAllergies(mockGuestId), { wrapper });
    
    // getIconForCustomAllergy should have been called for the custom allergy
    expect(getIconForCustomAllergy).toHaveBeenCalledWith('CustomAllergy1');
  });
  
  it('should reset all allergies correctly [ wip]', () => {
    const wrapper = ({ children }) => <RecoilRoot>{children}</RecoilRoot>;
    
    const { result } = renderHook(() => useFoodAllergies(mockGuestId), { wrapper });
    
    act(() => {
      result.current.resetAllergies();
    });
    
    // Check that updateFamilyGuestFoodAllergies was called with ['none']
    expect(mockUpdateFamilyGuestFoodAllergies).toHaveBeenCalledWith(
      mockGuestId,
      ['none']
    );
  });
});