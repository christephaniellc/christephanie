import { act, renderHook } from '@testing-library/react';
import { useAuth0Queries } from './useAuth0Queries';
import { useAuth0 } from '@auth0/auth0-react';
import { mockUseAuth0 } from '../../test-utils/mockContextProviders';
import { getConfig } from '@/auth_config';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ApiContext } from '@/context/ApiContext';
import React from 'react';

// Mock modules
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('recoil', () => ({
  useRecoilState: jest.fn(),
  useRecoilValue: jest.fn(),
}));

jest.mock('@/auth_config', () => ({
  getConfig: jest.fn().mockReturnValue({
    domain: 'test-domain.example.com',
    clientId: 'test-client-id',
    audience: 'https://test-api.example.com',
    webserviceUrl: 'https://test-api.example.com',
    returnTo: 'https://test-return.example.com'
  })
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useCallback: jest.fn((cb) => cb),
  useEffect: jest.fn(),
}));

describe('useAuth0Queries', () => {
  // Setup mocks
  const mockLoginWithRedirect = jest.fn();
  const mockLogout = jest.fn().mockResolvedValue(undefined);
  const mockGetAccessTokenSilently = jest.fn();
  const mockSetUser = jest.fn();
  const mockUpdateClientInfo = jest.fn().mockResolvedValue(undefined);
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth0
    mockUseAuth0({ 
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout,
      getAccessTokenSilently: mockGetAccessTokenSilently.mockResolvedValue('test-token'),
      isAuthenticated: true,
      user: { sub: 'test-user-id' }
    });
    
    // Mock useRecoilState and useRecoilValue
    (useRecoilState as jest.Mock).mockReturnValue([
      { auth0Id: '', firstName: 'Test', lastName: 'User' },
      { setUser: mockSetUser }
    ]);
    
    (useRecoilValue as jest.Mock).mockReturnValue({
      auth0Id: '',
      firstName: 'Test',
      lastName: 'User'
    });
    
    // Mock useContext for ApiContext
    (React.useContext as jest.Mock).mockReturnValue({
      updateClientInfo: mockUpdateClientInfo
    });
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get access token successfully', async () => {
    const { result } = renderHook(() => useAuth0Queries());
    mockGetAccessTokenSilently.mockResolvedValueOnce('new-access-token');
    
    let token;
    await act(async () => {
      token = await result.current.getAccessTokenPleasePleasePlease();
    });
    
    expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
      authorizationParams: {
        audience: 'https://test-api.example.com',
      },
      timeoutInSeconds: 10,
      cacheMode: 'off'
    });
    expect(token).toBe('new-access-token');
  });
  
  it('should handle token expiration by redirecting to login', async () => {
    // Mock user as not authenticated (token expired)
    mockUseAuth0({
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout,
      getAccessTokenSilently: mockGetAccessTokenSilently.mockRejectedValue(
        new Error('login_required')
      ),
      isAuthenticated: false,
      user: null
    });
    
    const { result } = renderHook(() => useAuth0Queries());
    
    await act(async () => {
      try {
        await result.current.getAccessTokenPleasePleasePlease();
      } catch (error) {
        // Expected to throw
      }
    });
    
    // Should have tried to redirect for login
    expect(mockLoginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: {
        audience: 'https://test-api.example.com',
      }
    });
  });
  
  it('should simulate token expiry correctly in development', async () => {
    // Mock window.location.hostname for development
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        hostname: 'www.dev.wedding.christephanie.com'
      },
      writable: true
    });
    
    const { result } = renderHook(() => useAuth0Queries());
    
    let success;
    await act(async () => {
      success = await result.current.simulateTokenExpiry();
    });
    
    expect(success).toBe(true);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(
      '@@auth0spajs@@::test-client-id::https://test-api.example.com::openid profile email'
    );
  });
  
  it('should not simulate token expiry in production', async () => {
    // Mock window.location.hostname for production
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        hostname: 'www.wedding.christephanie.com'
      },
      writable: true
    });
    
    const { result } = renderHook(() => useAuth0Queries());
    
    let success;
    await act(async () => {
      success = await result.current.simulateTokenExpiry();
    });
    
    expect(success).toBe(false);
    expect(window.localStorage.removeItem).not.toHaveBeenCalled();
  });
  
  it('should log out user and clean up localStorage', async () => {
    const { result } = renderHook(() => useAuth0Queries());
    
    await act(async () => {
      await result.current.logOutFromAuth0();
    });
    
    expect(mockLogout).toHaveBeenCalledWith({ returnTo: 'https://test-return.example.com' });
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('family');
  });
});