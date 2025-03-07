import { renderHook, act } from '@testing-library/react';
import { useCampingPreferences } from '../hooks';
import { guestSelector, useFamily } from '@/store/family';
import { SleepPreferenceEnum, RoleEnum } from '@/types/api';
import { RecoilRoot, useRecoilValue } from 'recoil';
import * as React from 'react';

// Mock React's useState to fix the "Cannot read properties of undefined" error
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn().mockImplementation(originalReact.useState),
    useEffect: jest.fn().mockImplementation(originalReact.useEffect),
    useMemo: jest.fn().mockImplementation(originalReact.useMemo),
  };
});

// Mock dependencies
jest.mock('@/store/family', () => ({
  guestSelector: jest.fn(),
  useFamily: jest.fn(),
}));

jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilValue: jest.fn(),
}));

describe('useCampingPreferences hook', () => {
  const mockUpdateFamilyGuestSleepingPreference = jest.fn();
  const mockFamilyActions = {
    updateFamilyGuestSleepingPreference: mockUpdateFamilyGuestSleepingPreference,
    patchFamilyMutation: { isPending: false },
    getFamilyUnitQuery: { isFetching: false },
  };

  const mockGuest = {
    guestId: '123',
    firstName: 'John',
    lastName: 'Doe',
    roles: [RoleEnum.Guest],
    preferences: {
      sleepPreference: SleepPreferenceEnum.Unknown,
    },
  };

  const mockManorGuest = {
    ...mockGuest,
    roles: [RoleEnum.Guest, RoleEnum.Manor],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useFamily hook
    (useFamily as jest.Mock).mockReturnValue([null, mockFamilyActions]);
    
    // Mock useRecoilValue to return the mock guest
    (useRecoilValue as jest.Mock).mockReturnValue(mockGuest);
    
    // Setup guestSelector mock
    (guestSelector as jest.Mock).mockReturnValue(() => mockGuest);
  });

  it('should initialize with correct default values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>{children}</RecoilRoot>
    );
    
    const { result } = renderHook(() => useCampingPreferences('123'), { wrapper });
    
    expect(result.current.campingValue).toBe(SleepPreferenceEnum.Unknown);
    expect(result.current.takingShuttle).toBe(true);
    expect(result.current.expandedHotel).toBeNull();
    expect(result.current.hasManorRole).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.hotelOptions.length).toBe(3);
  });

  it('should detect Manor role correctly', () => {
    // Mock useRecoilValue to return a guest with Manor role
    (useRecoilValue as jest.Mock).mockReturnValue(mockManorGuest);
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>{children}</RecoilRoot>
    );
    
    const { result } = renderHook(() => useCampingPreferences('123'), { wrapper });
    
    expect(result.current.hasManorRole).toBe(true);
  });

  it('should update sleep preference when handleChangeSleepPreference is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>{children}</RecoilRoot>
    );
    
    const { result } = renderHook(() => useCampingPreferences('123'), { wrapper });
    
    // Mock the event object
    const mockEvent = {
      currentTarget: { id: 'camping-button' },
    } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;
    
    // Call the handler
    act(() => {
      result.current.handleChangeSleepPreference(mockEvent, SleepPreferenceEnum.Camping);
    });
    
    // Check that the proper function was called with right arguments
    expect(mockUpdateFamilyGuestSleepingPreference).toHaveBeenCalledWith(
      '123',
      SleepPreferenceEnum.Camping
    );
  });

  it('should toggle hotel details correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>{children}</RecoilRoot>
    );
    
    const { result } = renderHook(() => useCampingPreferences('123'), { wrapper });
    
    // Initially expandedHotel should be null
    expect(result.current.expandedHotel).toBeNull();
    
    // Expand hotel at index 1
    act(() => {
      result.current.handleToggleHotelDetails(1);
    });
    
    // Now expandedHotel should be 1
    expect(result.current.expandedHotel).toBe(1);
    
    // Click again on the same hotel to collapse it
    act(() => {
      result.current.handleToggleHotelDetails(1);
    });
    
    // Now expandedHotel should be null again
    expect(result.current.expandedHotel).toBeNull();
  });
});