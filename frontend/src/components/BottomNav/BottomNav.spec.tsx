import { render, screen, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { userState } from '@/store/user';
import { stdStepperState } from '@/store/steppers/steppers';
import { RoleEnum } from '@/types/api';

// Mock utility function
jest.mock('@/utils/roles', () => ({
  isAdmin: jest.fn()
}));

import { isAdmin } from '@/utils/roles';

// Mock Auth0 hook
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(() => ({
    user: { sub: 'auth0|123' },
    loginWithRedirect: jest.fn()
  }))
}));

// Mock other hooks
jest.mock('@/hooks/useAuth0Queries', () => ({
  useAuth0Queries: jest.fn(() => ({
    logOutFromAuth0: jest.fn()
  }))
}));

describe('BottomNav Component.wip', () => {
  const mockIsAdmin = isAdmin as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render admin button when user is not admin.wip', async () => {
    // Arrange
    mockIsAdmin.mockReturnValue(false);
    const initialState = {
      [userState.key]: { 
        guestId: 'test-id',
        roles: [RoleEnum.Guest]
      },
      [stdStepperState.key]: {
        currentStep: ['home']
      }
    };

    // Act
    render(
      <RecoilRoot initializeState={({ set }) => {
        Object.entries(initialState).forEach(([key, value]) => {
          set({ key } as any, value);
        });
      }}>
        <BrowserRouter>
          <BottomNav />
        </BrowserRouter>
      </RecoilRoot>
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });

  it('should render admin button when user is admin.wip', async () => {
    // Arrange
    mockIsAdmin.mockReturnValue(true);
    const initialState = {
      [userState.key]: { 
        guestId: 'test-id',
        roles: [RoleEnum.Guest, RoleEnum.Admin]
      },
      [stdStepperState.key]: {
        currentStep: ['home']
      }
    };

    // Act
    render(
      <RecoilRoot initializeState={({ set }) => {
        Object.entries(initialState).forEach(([key, value]) => {
          set({ key } as any, value);
        });
      }}>
        <BrowserRouter>
          <BottomNav />
        </BrowserRouter>
      </RecoilRoot>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('should always render standard navigation buttons regardless of admin status.wip', async () => {
    // Arrange
    mockIsAdmin.mockReturnValue(false);
    const initialState = {
      [userState.key]: { 
        guestId: 'test-id',
        roles: [RoleEnum.Guest]
      },
      [stdStepperState.key]: {
        currentStep: ['home']
      }
    };

    // Act
    render(
      <RecoilRoot initializeState={({ set }) => {
        Object.entries(initialState).forEach(([key, value]) => {
          set({ key } as any, value);
        });
      }}>
        <BrowserRouter>
          <BottomNav />
        </BrowserRouter>
      </RecoilRoot>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Save the Date')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });
});