import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { userState } from '@/store/user';
import { RoleEnum } from '@/types/api';

// Mock utility function
jest.mock('@/utils/roles', () => ({
  isAdmin: jest.fn()
}));

import { isAdmin } from '@/utils/roles';

describe('ProtectedRoute.wip', () => {
  const mockIsAdmin = isAdmin as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render loading spinner when user data is not loaded.wip', () => {
    // Arrange
    const initialState = {
      [userState.key]: { guestId: '' } // Empty user state
    };

    // Act
    render(
      <RecoilRoot initializeState={({ set }) => {
        Object.entries(initialState).forEach(([key, value]) => {
          set({ key } as any, value);
        });
      }}>
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </RecoilRoot>
    );

    // Assert
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render children when user data is loaded and no admin role is required.wip', () => {
    // Arrange
    const initialState = {
      [userState.key]: { 
        guestId: 'test-id',
        roles: [RoleEnum.Guest]
      }
    };

    // Act
    render(
      <RecoilRoot initializeState={({ set }) => {
        Object.entries(initialState).forEach(([key, value]) => {
          set({ key } as any, value);
        });
      }}>
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </RecoilRoot>
    );

    // Assert
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when admin role is required but user is not admin.wip', () => {
    // Arrange
    const initialState = {
      [userState.key]: { 
        guestId: 'test-id',
        roles: [RoleEnum.Guest]
      }
    };
    
    mockIsAdmin.mockReturnValue(false);
    
    // Act
    render(
      <RecoilRoot initializeState={({ set }) => {
        Object.entries(initialState).forEach(([key, value]) => {
          set({ key } as any, value);
        });
      }}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <div>Admin Content</div>
              </ProtectedRoute>
            } />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </RecoilRoot>
    );

    // Assert
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('should render admin content when user is admin.wip', () => {
    // Arrange
    const initialState = {
      [userState.key]: { 
        guestId: 'test-id',
        roles: [RoleEnum.Guest, RoleEnum.Admin]
      }
    };
    
    mockIsAdmin.mockReturnValue(true);
    
    // Act
    render(
      <RecoilRoot initializeState={({ set }) => {
        Object.entries(initialState).forEach(([key, value]) => {
          set({ key } as any, value);
        });
      }}>
        <MemoryRouter>
          <ProtectedRoute requireAdmin>
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </RecoilRoot>
    );

    // Assert
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});