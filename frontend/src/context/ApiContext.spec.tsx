import { render, act, waitFor } from '@testing-library/react';
import { ApiContext, ApiContextProvider, useApiContext } from '@/context/ApiContext';
import { RecoilRoot } from 'recoil';
import { Auth0ContextInterface, Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { FamilyUnitViewModel } from '@/types/api';
import React from 'react';

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: { children: React.ReactElement }) => children,
  useAuth0: jest.fn(),
  useApiContext: jest.fn(),
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
      const { getAllFamilies } = React.useContext(ApiContext);
      const [families, setFamilies] = React.useState<FamilyUnitViewModel[]>([]);
      const [error, setError] = React.useState<Error | null>(null);
      const [called, setCalled] = React.useState(false);

      React.useEffect(() => {
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
});