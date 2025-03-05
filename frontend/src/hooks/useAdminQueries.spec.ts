import { renderHook } from '@testing-library/react';
import { useAdminQueries } from './useAdminQueries';
import { ApiContext } from '@/context/ApiContext';
import { useContext } from 'react';

// Mock React's useContext
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

// Mock the useQuery hook
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('useAdminQueries.wip', () => {
  beforeEach(() => {
    // Setup mock for useContext
    (useContext as jest.Mock).mockReturnValue({
      getAllFamilies: jest.fn().mockResolvedValue([
        {
          invitationCode: 'TEST123',
          unitName: 'Test Family',
        },
      ]),
    });
  });

  it('should return getAllFamiliesQuery', () => {
    const { result } = renderHook(() => useAdminQueries());
    
    expect(result.current).toHaveProperty('getAllFamiliesQuery');
    expect(result.current.getAllFamiliesQuery).toHaveProperty('refetch');
  });

  it('should call useContext with ApiContext', () => {
    renderHook(() => useAdminQueries());
    
    expect(useContext).toHaveBeenCalledWith(ApiContext);
  });
});