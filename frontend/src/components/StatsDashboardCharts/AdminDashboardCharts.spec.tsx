import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import AdminDashboardCharts from './AdminDashboardCharts';
import { FamilyUnitViewModel, InvitationResponseEnum, RoleEnum } from '@/types/api';
import { ThemeProvider } from '@mui/material/styles';
import themes from '@/theme/themes';
import { BrowserRouter } from 'react-router-dom';

// Mock data
const mockFamilies: FamilyUnitViewModel[] = [
  {
    invitationCode: 'FAM1',
    unitName: 'Smith Family',
    guests: [
      {
        guestId: 'GUEST1',
        firstName: 'John',
        lastName: 'Smith',
        roles: [RoleEnum.Guest],
        preferences: {
          foodAllergies: ['Peanut', 'Gluten', 'Dairy', 'Shellfish']
        },
        rsvp: {
          invitationResponse: InvitationResponseEnum.Interested
        }
      },
      {
        guestId: 'GUEST2',
        firstName: 'Jane',
        lastName: 'Smith',
        roles: [RoleEnum.Guest],
        preferences: {
          foodAllergies: ['Shellfish', 'Tree Nuts', 'Soy']
        },
        rsvp: {
          invitationResponse: InvitationResponseEnum.Interested
        }
      }
    ]
  },
  {
    invitationCode: 'FAM2',
    unitName: 'Jones Family',
    guests: [
      {
        guestId: 'GUEST3',
        firstName: 'Bob',
        lastName: 'Jones',
        roles: [RoleEnum.Guest],
        preferences: {
          foodAllergies: ['Sesame', 'Eggs', 'Fish', 'Honey', 'Mustard']
        },
        rsvp: {
          invitationResponse: InvitationResponseEnum.Interested
        }
      }
    ]
  },
  {
    invitationCode: 'FAM3',
    unitName: 'Johnson Family',
    guests: [
      {
        guestId: 'GUEST4',
        firstName: 'Mary',
        lastName: 'Johnson',
        roles: [RoleEnum.Guest],
        preferences: {
          foodAllergies: ['None']
        },
        rsvp: {
          invitationResponse: InvitationResponseEnum.Interested
        }
      }
    ]
  },
  {
    invitationCode: 'FAM4',
    unitName: 'Williams Family',
    guests: [
      {
        guestId: 'GUEST5',
        firstName: 'Sarah',
        lastName: 'Williams',
        roles: [RoleEnum.Guest],
        preferences: {
          foodAllergies: ['Chocolate', 'Citrus']
        },
        rsvp: {
          invitationResponse: InvitationResponseEnum.Interested
        }
      }
    ]
  },
  {
    invitationCode: 'FAM5',
    unitName: 'Davis Family',
    guests: [
      {
        guestId: 'GUEST6',
        firstName: 'Tom',
        lastName: 'Davis',
        roles: [RoleEnum.Guest],
        preferences: {
          foodAllergies: ['Garlic']
        },
        rsvp: {
          invitationResponse: InvitationResponseEnum.Interested
        }
      }
    ]
  },
  {
    invitationCode: 'FAM6',
    unitName: 'Wilson Family',
    guests: [
      {
        guestId: 'GUEST7',
        firstName: 'Laura',
        lastName: 'Wilson',
        roles: [RoleEnum.Guest],
        preferences: {
          foodAllergies: []
        },
        rsvp: {
          invitationResponse: InvitationResponseEnum.Pending
        }
      }
    ]
  }
];

// Wrapper for rendering with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={themes.dark}>
        {ui}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('AdminDashboardCharts', () => {
  it('renders without crashing', () => {
    renderWithProviders(<AdminDashboardCharts families={[]} loading={false} />);
    expect(screen.getByText('Wedding Dashboard')).toBeInTheDocument();
  });

  it('displays loading spinner when loading is true', () => {
    renderWithProviders(<AdminDashboardCharts families={[]} loading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays allergies tab with top 5 most allergic guests [ wip]', () => {
    renderWithProviders(<AdminDashboardCharts families={mockFamilies} loading={false} />);
    
    // Find and click on the allergies tab
    const allergiesTab = screen.getByRole('tab', { name: /allergies/i });
    act(() => {
      allergiesTab.click();
    });
    
    // Check if the tab content is displayed
    expect(screen.getByText('Top 5 Most Allergic Guests')).toBeInTheDocument();
    
    // Check if Bob Jones (with 5 allergies) is at the top of the list
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThan(0);
    
    const firstListItem = listItems[0];
    expect(within(firstListItem).getByText(/Bob Jones/i)).toBeInTheDocument();
    expect(within(firstListItem).getByText(/5 allergies/i)).toBeInTheDocument();
    
    // Check if John Smith (with 4 allergies) is second on the list
    const secondListItem = listItems[1];
    expect(within(secondListItem).getByText(/John Smith/i)).toBeInTheDocument();
    expect(within(secondListItem).getByText(/4 allergies/i)).toBeInTheDocument();
    
    // Check if Jane Smith (with 3 allergies) is third on the list
    const thirdListItem = listItems[2];
    expect(within(thirdListItem).getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(within(thirdListItem).getByText(/3 allergies/i)).toBeInTheDocument();
  });

  it('displays allergy statistics in the allergies tab [ wip]', () => {
    renderWithProviders(<AdminDashboardCharts families={mockFamilies} loading={false} />);
    
    // Find and click on the allergies tab
    const allergiesTab = screen.getByRole('tab', { name: /allergies/i });
    act(() => {
      allergiesTab.click();
    });
    
    // Check if the statistics section is displayed
    expect(screen.getByText('Allergy Statistics')).toBeInTheDocument();
    
    // Check for key statistics
    expect(screen.getByText(/Total Guests with Allergies:/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Allergies Reported:/i)).toBeInTheDocument();
    expect(screen.getByText(/Unique Allergies:/i)).toBeInTheDocument();
    expect(screen.getByText(/Most Common Allergy:/i)).toBeInTheDocument();
  });

  it('correctly identifies guests with no allergies [ wip]', () => {
    renderWithProviders(<AdminDashboardCharts families={mockFamilies} loading={false} />);
    
    // Find and click on the allergies tab
    const allergiesTab = screen.getByRole('tab', { name: /allergies/i });
    act(() => {
      allergiesTab.click();
    });
    
    // Mary Johnson has "None" as allergy and should not be in the list
    // To verify this, we check that we can find the 5 guests with allergies
    // but can't find Mary Johnson in the list
    const listItems = screen.getAllByRole('listitem');
    
    // There should be 5 guests with allergies
    expect(listItems.length).toBe(5);
    
    // Check that Mary Johnson is not in the list
    const maryInList = listItems.some(item => 
      within(item).queryByText(/Mary Johnson/i) !== null
    );
    expect(maryInList).toBe(false);
  });

  it('shows award icons for the top allergic guests [ wip]', () => {
    renderWithProviders(<AdminDashboardCharts families={mockFamilies} loading={false} />);
    
    // Find and click on the allergies tab
    const allergiesTab = screen.getByRole('tab', { name: /allergies/i });
    act(() => {
      allergiesTab.click();
    });
    
    // Check for presence of award icons
    const avatars = screen.getAllByRole('img', { hidden: true });
    expect(avatars.length).toBeGreaterThan(0);
  });
});