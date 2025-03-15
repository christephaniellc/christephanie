import { act, renderHook } from '@testing-library/react';
import { useAuth0Utils } from '@/hooks/useAuth0Utils';
import { useAuth0 } from '@auth0/auth0-react';
import { mockUseAuth0 } from '../../test-utils/mockContextProviders';
import { getConfig } from '@/auth_config';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
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

describe('useAuth0Utils', () => {
  const mockLoginWithRedirect = jest.fn();
  
  beforeEach(() => {
    mockUseAuth0({ 
      loginWithRedirect: mockLoginWithRedirect,
      getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
      isAuthenticated: true,
      user: { sub: 'test-user-id' },
      logout: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  
  it('should attach the users guestId when it makes a call to auth0 to log in', () => {
    const { result } = renderHook(() => useAuth0Utils());
    result.current.loginUser('1234');
    expect(useAuth0).toHaveBeenCalled();
    expect(mockLoginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: {
        screen_hint: 'signup',
        guest_id: '1234',
      },
    });
  });
});

// The token expiration tests should be in a separate file for the Auth0Queries hook