import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommunicationPreferences from './CommunicationPreferences';
import { RecoilRoot } from 'recoil';
import { NotificationPreferenceEnum } from '@/types/api';

// Mock auth_config to avoid import.meta issues
jest.mock('@/auth_config', () => ({
  getConfig: jest.fn().mockReturnValue({
    domain: 'test.domain.com',
    clientId: 'test-client-id',
    audience: 'https://test-api.com',
    webserviceUrl: 'https://test-api.com',
    returnTo: 'https://test-return.com'
  })
}));

// Mock the family store
jest.mock('@/store/family', () => ({
  guestSelector: () => ({
    key: 'test-key',
    preferences: {
      notificationPreference: [NotificationPreferenceEnum.Email],
    },
    email: {
      maskedValue: 'test@example.com',
    },
    phone: {
      maskedValue: '123-456-7890',
    },
  }),
  useFamily: () => [
    null,
    {
      updateFamilyGuestCommunicationPreference: jest.fn(),
      patchFamilyMutation: { isPending: false },
      getFamilyUnitQuery: { isFetching: false },
    },
  ],
}));

// Mock the context providers
jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => ({
    screenWidth: 1024,
  }),
}));

// Create a custom AppLayoutProvider for testing
const AppLayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <RecoilRoot>
      <AppLayoutProvider>{ui}</AppLayoutProvider>
    </RecoilRoot>
  );
};

describe('CommunicationPreferences component styling.wip', () => {
  it('should render with correct styling.wip', () => {
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // Check for Stack component with proper styling
    const stackElement = screen.getByTestId('stack-container');
    expect(stackElement).toHaveStyle({
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    });
    
    // Check for Paper component
    const paperElement = screen.getByTestId('paper-container');
    expect(paperElement).toHaveAttribute('elevation', '5');
    
    // Check for ButtonGroup with proper orientation
    const buttonGroup = screen.getByTestId('button-group');
    expect(buttonGroup).toHaveAttribute('orientation', 'horizontal');
    
    // Check that buttons are properly styled
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2); // Email and Phone buttons
    
    // Check that icons are rendered
    const emailIcon = screen.getByTestId('email-icon');
    const phoneIcon = screen.getByTestId('phone-icon');
    expect(emailIcon).toBeInTheDocument();
    expect(phoneIcon).toBeInTheDocument();
  });
  
  it('should switch to vertical orientation on mobile screens.wip', () => {
    // Override the screenWidth mock for this test - simplified for build
    const mockUseAppLayout = jest.requireMock('@/context/Providers/AppState/useAppLayout');
    mockUseAppLayout.useAppLayout.mockReturnValue({
      screenWidth: 600,
    });
    
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    const buttonGroup = screen.getByTestId('button-group');
    expect(buttonGroup).toHaveAttribute('orientation', 'vertical');
  });
});