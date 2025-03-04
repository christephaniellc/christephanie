import { render, screen, waitFor } from '@testing-library/react';
import Admin from './Admin';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { RoleEnum, AgeGroupEnum, RsvpEnum } from '@/types/api';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the auth_config module to avoid import.meta issues
jest.mock('@/auth_config', () => ({
  getConfig: jest.fn().mockReturnValue({
    domain: 'test.domain.com',
    clientId: 'test-client-id',
    audience: 'https://test-api.com',
    webserviceUrl: 'https://test-api.com',
    returnTo: 'https://test-return.com'
  })
}));

// Mock React for createContext
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createContext: jest.fn().mockReturnValue({
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

// Mock the useAdminQueries hook
jest.mock('@/hooks/useAdminQueries');

const theme = createTheme();

// Helper to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('Admin.wip', () => {
  beforeEach(() => {
    // Setup default mock implementation
    (useAdminQueries as jest.Mock).mockReturnValue({
      getAllFamiliesQuery: {
        refetch: jest.fn().mockResolvedValue({
          data: [
            {
              invitationCode: 'ABC123',
              unitName: 'Smith Family',
              guests: [
                { 
                  firstName: 'John', 
                  lastName: 'Smith',
                  guestId: '123',
                  roles: [RoleEnum.Guest],
                  ageGroup: AgeGroupEnum.Adult,
                  rsvp: {
                    wedding: RsvpEnum.Attending
                  }
                },
                { 
                  firstName: 'Jane', 
                  lastName: 'Smith',
                  guestId: '456',
                  roles: [RoleEnum.Guest],
                  ageGroup: AgeGroupEnum.Adult,
                  rsvp: {
                    wedding: RsvpEnum.Attending
                  }
                }
              ],
              mailingAddress: {
                streetAddress: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                postalCode: '12345'
              },
              familyUnitLastLogin: '2023-01-01T12:00:00Z'
            }
          ]
        })
      }
    });
  });

  it('should render the Admin dashboard title', async () => {
    renderWithTheme(<Admin />);
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('should initially show loading state', () => {
    renderWithTheme(<Admin />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display family data after loading', async () => {
    renderWithTheme(<Admin />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Smith Family')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getAllByText('Wedding').length).toBeGreaterThan(0);
  });
  
  it('should handle families with no mailing address', async () => {
    // Override mock for this test
    (useAdminQueries as jest.Mock).mockReturnValue({
      getAllFamiliesQuery: {
        refetch: jest.fn().mockResolvedValue({
          data: [
            {
              invitationCode: 'ABC123',
              unitName: 'Smith Family',
              guests: [
                { 
                  firstName: 'John', 
                  lastName: 'Smith',
                  guestId: '123',
                  roles: [RoleEnum.Guest],
                  ageGroup: AgeGroupEnum.Adult,
                  rsvp: {
                    wedding: RsvpEnum.Pending
                  }
                }
              ],
              // No mailingAddress
              familyUnitLastLogin: null
            }
          ]
        })
      }
    });
    
    renderWithTheme(<Admin />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('No address provided')).toBeInTheDocument();
    expect(screen.getByText('Never logged in')).toBeInTheDocument(); // No last login
  });
  
  it('should handle API error', async () => {
    // Override mock for this test to simulate error
    (useAdminQueries as jest.Mock).mockReturnValue({
      getAllFamiliesQuery: {
        refetch: jest.fn().mockResolvedValue({
          error: new Error('Failed to fetch data')
        })
      }
    });
    
    renderWithTheme(<Admin />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to fetch families')).toBeInTheDocument();
  });
  
  it('should handle unexpected error during fetch', async () => {
    // Override mock for this test to throw error
    (useAdminQueries as jest.Mock).mockReturnValue({
      getAllFamiliesQuery: {
        refetch: jest.fn().mockRejectedValue(new Error('Network error'))
      }
    });
    
    renderWithTheme(<Admin />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('An error occurred while fetching families')).toBeInTheDocument();
  });
});