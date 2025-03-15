import { render, act, waitFor } from '@testing-library/react';
import { FamilyUnitViewModel } from '@/types/api';

// Mock auth_config to avoid import.meta issues
jest.mock('@/auth_config', () => ({
  getConfig: jest.fn().mockReturnValue({
    domain: "test-domain.example.com",
    clientId: "test-client-id",
    audience: "https://test-api.example.com",
    webserviceUrl: "https://test-api.example.com",
    returnTo: "https://test-return.example.com"
  })
}));

// Mock React createContext
const mockContext = {
  Provider: ({ children }: { children: React.ReactNode }) => children,
  Consumer: ({ children }: { children: React.ReactNode }) => children
};

const mockCreateContext = jest.fn().mockReturnValue(mockContext);

jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    createContext: mockCreateContext
  };
});

// Import after React mock is set up
import { ApiContext, ApiContextProvider, useApiContext } from '@/context/ApiContext';
import { RecoilRoot } from 'recoil';
import { Auth0ContextInterface, Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useState, useContext, useEffect } from 'react';

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: { children: React.ReactElement }) => children,
  useAuth0: jest.fn(),
  useApiContext: jest.fn(),
}));

// Mock the useAuth0Queries
jest.mock('@/hooks/useAuth0Queries', () => ({
  useAuth0Queries: jest.fn().mockReturnValue({
    getAccessTokenPleasePleasePlease: jest.fn().mockResolvedValue('refreshed-token'),
    logOutFromAuth0: jest.fn(),
    signInWithAuth0: jest.fn(),
    updateClientInfo: jest.fn().mockResolvedValue(undefined),
    simulateTokenExpiry: jest.fn().mockResolvedValue(true)
  })
}));

// Mock the Api class
jest.mock('@/api/Api', () => {
  return jest.fn().mockImplementation(() => ({
    getFamilyUnit: jest.fn().mockResolvedValue({}),
    getAllFamilies: jest.fn().mockResolvedValue([
      {
        invitationCode: 'TEST123',
        unitName: 'Test Family',
      },
    ]),
    getMe: jest.fn().mockResolvedValue({}),
    validateAddress: jest.fn().mockResolvedValue({}),
    patchFamilyUnit: jest.fn().mockResolvedValue({}),
    patchGuestDto: jest.fn().mockResolvedValue({}),
    validatePhone: jest.fn().mockResolvedValue({ success: true }),
    validateEmail: jest.fn().mockResolvedValue({ success: true }),
    getMaskedValue: jest.fn().mockResolvedValue({ value: 'masked@example.com', verified: true }),
    patchUser: jest.fn().mockResolvedValue({}),
  }));
});

describe('ApiContext', () => {
  beforeEach(() => {
    // Setup Auth0 mock
    (useAuth0 as jest.Mock).mockImplementation(() => ({
      isAuthenticated: true,
      user: { sub: '123' },
      getAccessTokenSilently: jest.fn().mockResolvedValue('token123'),
      loginWithRedirect: jest.fn(),
      loginWithPopup: jest.fn(),
      logout: jest.fn(),
      getIdTokenClaims: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      handleRedirectCallback: jest.fn(),
      isLoading: false,
      error: null,
    } as unknown as Auth0ContextInterface));
  });
  
  it('should render with children.wip', () => {
    const { getByTestId } = render(
      <Auth0Provider clientId="test" domain="test">
        <RecoilRoot>
          <ApiContextProvider>
            <div data-testid="apiContext" />
          </ApiContextProvider>
        </RecoilRoot>
      </Auth0Provider>
    );
    expect(getByTestId('apiContext')).toBeTruthy();
  });

  it('should provide getAllFamilies method.wip', async () => {
    // Create a test component that uses the ApiContext
    const TestComponent = () => {
      const { getAllFamilies } = useContext(ApiContext);
      const [families, setFamilies] = useState<FamilyUnitViewModel[]>([]);
      const [error, setError] = useState<Error | null>(null);
      const [called, setCalled] = useState(false);

      useEffect(() => {
        const fetchData = async () => {
          try {
            const result = await getAllFamilies();
            setFamilies(result);
            setCalled(true);
          } catch (err) {
            setError(err as Error);
          }
        };
        fetchData();
      }, [getAllFamilies]);

      if (error) return <div>Error: {error.message}</div>;
      return (
        <div>
          <div data-testid="called">{called ? 'true' : 'false'}</div>
          <div data-testid="families">
            {families.length > 0 ? families[0].invitationCode : 'No families'}
          </div>
        </div>
      );
    };

    const { getByTestId } = render(
      <Auth0Provider clientId="test" domain="test">
        <RecoilRoot>
          <ApiContextProvider>
            <TestComponent />
          </ApiContextProvider>
        </RecoilRoot>
      </Auth0Provider>
    );

    await waitFor(() => {
      expect(getByTestId('called').textContent).toBe('true');
      expect(getByTestId('families').textContent).toBe('TEST123');
    });
  });
  
  it('should handle token expiration in queries [wip]', async () => {
    // Mock API to return an error
    const mockUnauthorizedError = {
      status: 401,
      error: 'Unauthorized',
      description: 'Token has expired'
    };
    
    const mockApi = {
      getMe: jest.fn().mockRejectedValueOnce(mockUnauthorizedError)
        .mockResolvedValueOnce({ id: 'test-user' }),
      getAccessTokenSilently: jest.fn().mockResolvedValue('test-token'),
      getFamilyUnit: jest.fn().mockResolvedValue({})
    };
    
    // Import Api directly at the top level
    const ApiConstructor = jest.requireMock('@/api/Api').default;
    ApiConstructor.mockImplementation(() => mockApi);
    
    // Setup mock getAccessTokenPleasePleasePlease
    const mockGetTokenFn = jest.fn().mockResolvedValue('new-token');
    const mockUseAuth0Queries = jest.requireMock('@/hooks/useAuth0Queries').useAuth0Queries;
    mockUseAuth0Queries.mockReturnValue({
      getAccessTokenPleasePleasePlease: mockGetTokenFn,
      updateClientInfo: jest.fn().mockResolvedValue(undefined)
    });
    
    // Create a test component to use the query
    const TestComponent = () => {
      const { getMeQuery } = useContext(ApiContext);
      return (
        <div>
          <div data-testid="loading">{getMeQuery.isLoading.toString()}</div>
          <div data-testid="error">{getMeQuery.isError.toString()}</div>
          <div data-testid="success">{getMeQuery.isSuccess.toString()}</div>
          <div data-testid="status">{getMeQuery.status}</div>
        </div>
      );
    };
    
    const { getByTestId } = render(
      <Auth0Provider clientId="test" domain="test">
        <RecoilRoot>
          <ApiContextProvider>
            <TestComponent />
          </ApiContextProvider>
        </RecoilRoot>
      </Auth0Provider>
    );
    
    // Initially it should be loading
    expect(getByTestId('loading').textContent).toBe('true');
    
    // When the error occurs, token refresh should be attempted
    await waitFor(() => {
      expect(mockGetTokenFn).toHaveBeenCalled();
    });
    
    // After token refresh and successful retry
    await waitFor(() => {
      expect(getByTestId('success').textContent).toBe('true');
    });
  });
  
  it('should show error state and log out after multiple auth failures [wip]', async () => {
    // Setup mock unauthorized error
    const mockUnauthorizedError = {
      status: 401,
      error: 'Unauthorized',
      description: 'Token has expired'
    };
    
    // Mock API to always return 401
    const mockApi = {
      getMe: jest.fn().mockRejectedValue(mockUnauthorizedError),
      getAccessTokenSilently: jest.fn().mockResolvedValue('test-token'),
      getFamilyUnit: jest.fn().mockRejectedValue(mockUnauthorizedError)
    };
    
    // Import Api directly at the top level
    const ApiConstructor = jest.requireMock('@/api/Api').default;
    ApiConstructor.mockImplementation(() => mockApi);
    
    // Setup auth0 mocks
    const mockLogout = jest.fn();
    (useAuth0 as jest.Mock).mockImplementation(() => ({
      isAuthenticated: true,
      user: { sub: '123' },
      getAccessTokenSilently: jest.fn().mockResolvedValue('token123'),
      logout: mockLogout,
      isLoading: false,
      error: null,
    }));
    
    // Setup mock token refresh that fails
    const mockGetTokenFn = jest.fn().mockRejectedValue(new Error('Refresh failed'));
    const mockUseAuth0Queries = jest.requireMock('@/hooks/useAuth0Queries').useAuth0Queries;
    mockUseAuth0Queries.mockReturnValue({
      getAccessTokenPleasePleasePlease: mockGetTokenFn,
      updateClientInfo: jest.fn().mockResolvedValue(undefined)
    });
    
    // Test component that uses the queries
    const TestComponent = () => {
      const { getMeQuery, getFamilyUnitQuery } = useContext(ApiContext);
      return (
        <div>
          <div data-testid="me-error">{getMeQuery.isError.toString()}</div>
          <div data-testid="family-error">{getFamilyUnitQuery.isError.toString()}</div>
        </div>
      );
    };
    
    render(
      <Auth0Provider clientId="test" domain="test">
        <RecoilRoot>
          <ApiContextProvider>
            <TestComponent />
          </ApiContextProvider>
        </RecoilRoot>
      </Auth0Provider>
    );
    
    // Eventually both queries should error and logout should be called
    await waitFor(() => {
      expect(mockGetTokenFn).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});