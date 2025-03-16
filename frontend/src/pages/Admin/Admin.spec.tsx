import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Admin from './Admin';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { RoleEnum, AgeGroupEnum, InvitationResponseEnum } from '@/types/api';
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

// Import mocks need to come before imports
// Mock React createContext
const mockContext = {
  Provider: ({ children }: { children: React.ReactNode }) => children,
  Consumer: ({ children }: { children: React.ReactNode }) => children
};

jest.mock('react', () => {
  // We don't want to "requireActual" here since that might cause circular dependencies
  const React = {
    createElement: (...args: any[]) => args,
    // Add other methods you need
    Fragment: 'Fragment',
    Suspense: 'Suspense',
    useEffect: () => {},
    useState: () => [null, () => {}]
  };
  
  return {
    ...React,
    createContext: jest.fn().mockReturnValue(mockContext)
  };
});

// Mock the useAdminQueries hook
jest.mock('@/hooks/useAdminQueries');

// Mock GuestStatusItem to avoid material-ui icon issues in tests
jest.mock('./components/GuestStatusItem', () => ({
  __esModule: true,
  default: ({ guest, onClick, compact }: any) => (
    <div 
      data-testid={compact ? `avatar-${guest.guestId}` : `guest-item-${guest.guestId}`}
      onClick={(e) => onClick(e, guest.guestId)}
    >
      {!compact && (
        <>
          <span>{guest.firstName} {guest.lastName}</span>
          <span data-testid="status-chip">Status</span>
        </>
      )}
      {compact && (
        <span data-testid="compact-initials">{guest.firstName[0]}{guest.lastName[0]}</span>
      )}
    </div>
  )
}));

const theme = createTheme();

// Helper to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('Admin.locked', () => {
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
                    invitationResponse: InvitationResponseEnum.Interested
                  }
                },
                { 
                  firstName: 'Jane', 
                  lastName: 'Smith',
                  guestId: '456',
                  roles: [RoleEnum.Guest],
                  ageGroup: AgeGroupEnum.Adult,
                  rsvp: {
                    invitationResponse: InvitationResponseEnum.Interested
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

  it('should render the Admin dashboard title.locked', async () => {
    renderWithTheme(<Admin />);
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('should initially show loading state.locked', () => {
    renderWithTheme(<Admin />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

describe('Updated Admin Dashboard.wip', () => {
  const mockFamilies = [
    {
      invitationCode: 'ABC123',
      unitName: 'Smith Family',
      tier: 'Platinum',
      guests: [
        { 
          firstName: 'John', 
          lastName: 'Smith',
          guestId: '123',
          roles: [RoleEnum.Guest],
          ageGroup: AgeGroupEnum.Adult,
          rsvp: {
            invitationResponse: InvitationResponseEnum.Interested,
            invitationResponseAudit: {
              lastUpdate: '2023-01-01T12:00:00Z',
              username: 'john.smith'
            }
          }
        },
        { 
          firstName: 'Jane', 
          lastName: 'Smith',
          guestId: '456',
          roles: [RoleEnum.Guest],
          ageGroup: AgeGroupEnum.Adult,
          rsvp: {
            invitationResponse: InvitationResponseEnum.Pending,
            invitationResponseAudit: {
              lastUpdate: '2023-01-10T12:00:00Z',
              username: 'jane.smith'
            }
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
    },
    {
      invitationCode: 'XYZ789',
      unitName: 'Jones Family',
      tier: 'Gold',
      guests: [
        { 
          firstName: 'Bob', 
          lastName: 'Jones',
          guestId: '789',
          roles: [RoleEnum.Guest],
          ageGroup: AgeGroupEnum.Adult,
          rsvp: {
            invitationResponse: InvitationResponseEnum.Declined,
            invitationResponseAudit: {
              lastUpdate: '2023-02-15T12:00:00Z',
              username: 'bob.jones'
            }
          }
        }
      ],
      mailingAddress: {
        streetAddress: '456 Oak St',
        city: 'Other Town',
        state: 'NY',
        postalCode: '54321'
      },
      familyUnitLastLogin: '2023-02-01T12:00:00Z'
    }
  ];
  
  beforeEach(() => {
    (useAdminQueries as jest.Mock).mockReturnValue({
      getAllFamiliesQuery: {
        refetch: jest.fn().mockResolvedValue({
          data: mockFamilies
        })
      }
    });
  });
  
  it('should show collapsed family cards by default.wip', async () => {
    renderWithTheme(<Admin />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Family header should be visible
    expect(screen.getByText('Smith Family')).toBeInTheDocument();
    
    // Should have avatars in collapsed view
    const avatarElements = await screen.findAllByTestId(/avatar-/);
    expect(avatarElements.length).toBe(2); // One for each family member
    
    // Address shouldn't be visible until expanded
    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
  });
  
  it('should expand family card when clicked.wip', async () => {
    renderWithTheme(<Admin />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find expand button (there will be one per family card)
    const expandButtons = await screen.findAllByTestId('expand-button');
    fireEvent.click(expandButtons[0]);
    
    // After expanding, address should be visible
    expect(await screen.findByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Anytown, CA 12345')).toBeInTheDocument();
    
    // And guest items should be visible
    const guestItems = await screen.findAllByTestId(/guest-item-/);
    expect(guestItems.length).toBe(2); // Both full guest items are shown
  });
  
  it('should handle families with mixed invitation responses.wip', async () => {
    // Two guests, one interested, one pending
    renderWithTheme(<Admin />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Family card should use the positive status color (because someone is interested)
    // This is hard to test in JSDOM directly, we check that the card is rendered
    expect(screen.getByTestId('family-card')).toBeInTheDocument();
    
    // Click to expand
    const expandButtons = await screen.findAllByTestId('expand-button');
    fireEvent.click(expandButtons[0]);
    
    // Both guests should be shown
    expect(screen.getByTestId('guest-item-123')).toBeInTheDocument(); // Interested
    expect(screen.getByTestId('guest-item-456')).toBeInTheDocument(); // Pending
  });
  
  it('should handle families with no mailing address.wip', async () => {
    // Override mock for this test
    (useAdminQueries as jest.Mock).mockReturnValue({
      getAllFamiliesQuery: {
        refetch: jest.fn().mockResolvedValue({
          data: [
            {
              ...mockFamilies[0],
              mailingAddress: null,
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
    
    // Expand the card
    const expandButtons = await screen.findAllByTestId('expand-button');
    fireEvent.click(expandButtons[0]);
    
    expect(screen.getByText('No address provided')).toBeInTheDocument();
    expect(screen.getByText('Never logged in')).toBeInTheDocument();
  });
  
  describe('Sort functionality.wip', () => {
    beforeEach(() => {
      // Override mock with extended family data
      (useAdminQueries as jest.Mock).mockReturnValue({
        getAllFamiliesQuery: {
          refetch: jest.fn().mockResolvedValue({
            data: mockFamilies
          })
        }
      });
    });
    
    it('should render sort options.wip', async () => {
      renderWithTheme(<Admin />);
      
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
      
      // Check if sort dropdown exists
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      
      // Default sort option should be selected
      expect(screen.getByText('Default (Tier, Name)')).toBeInTheDocument();
    });
    
    it('should allow changing sort option.wip', async () => {
      renderWithTheme(<Admin />);
      
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
      
      // Open dropdown
      fireEvent.mouseDown(screen.getByLabelText('Sort by'));
      
      // Should see all options
      expect(screen.getByText('Default (Tier, Name)')).toBeInTheDocument();
      expect(screen.getByText('Last Updated (Recent First)')).toBeInTheDocument();
      expect(screen.getByText('RSVP Status (Declined First)')).toBeInTheDocument();
      
      // Select Last Updated option
      fireEvent.click(screen.getByText('Last Updated (Recent First)'));
      
      // Dropdown should close and show selected option
      expect(screen.getByDisplayValue('lastUpdated')).toBeInTheDocument();
    });
  });
});