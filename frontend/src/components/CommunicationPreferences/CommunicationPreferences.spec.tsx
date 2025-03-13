import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    guestId: '123',
    firstName: 'Test',
    preferences: {
      notificationPreference: [NotificationPreferenceEnum.Email],
    },
    email: {
      maskedValue: 't***@e******.com',
      verified: true,
    },
    phone: {
      maskedValue: '***-***-7890',
      verified: false,
    },
  }),
  useFamily: () => [
    null,
    {
      updateFamilyGuestCommunicationPreference: jest.fn(),
      updateFamilyGuestEmail: jest.fn(),
      updateFamilyGuestPhone: jest.fn(),
      patchFamilyMutation: { isPending: false },
      getFamilyUnitQuery: { isFetching: false },
    },
  ],
}));

// Mock the API context with unmasked values
const mockRefetch = jest.fn();
const mockEmailQuery = {
  data: { value: 'test@example.com', verified: true },
  isLoading: false,
  isFetching: false,
  refetch: mockRefetch.mockResolvedValue({ data: { value: 'test@example.com', verified: true } }),
};

const mockPhoneQuery = {
  data: { value: '555-123-7890', verified: false },
  isLoading: false,
  isFetching: false,
  refetch: mockRefetch.mockResolvedValue({ data: { value: '555-123-7890', verified: false } }),
};

jest.mock('@/context/ApiContext', () => ({
  useApiContext: () => ({
    getMaskedValueQuery: (guestId, type) => 
      type === 'email' ? mockEmailQuery : mockPhoneQuery,
    validatePhoneMutation: {
      mutate: jest.fn((params, callbacks) => {
        if (callbacks && callbacks.onSuccess) {
          callbacks.onSuccess();
        }
      }),
    },
    validateEmailMutation: {
      mutate: jest.fn((params, callbacks) => {
        if (callbacks && callbacks.onSuccess) {
          callbacks.onSuccess();
        }
      }),
    },
  }),
}));

// Mock the context providers
jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => ({
    screenWidth: 1024,
  }),
}));

// Mocking useAuth0
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
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

describe('CommunicationPreferences component.locked', () => {
  it('should render the component correctly.locked', () => {
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
  
  it('should show masked email and phone values.locked', () => {
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    expect(screen.getByText('t***@e******.com')).toBeInTheDocument();
    expect(screen.getByText('***-***-7890')).toBeInTheDocument();
  });
});

describe('CommunicationPreferences unmasked values.wip', () => {
  it('should load unmasked email when opening email dialog.wip', async () => {
    renderWithProviders(<CommunicationPreferences guestId="123" />);

    // Find and click edit buttons
    const editButtons = screen.getAllByRole('button', { name: '' });
    const emailEditButton = editButtons[0]; // First edit button is for email
    
    // Click email edit button
    fireEvent.click(emailEditButton);
    
    // Check that the email query refetch was called
    expect(mockRefetch).toHaveBeenCalled();
    
    // Wait for dialog to appear with correct email value
    await waitFor(() => {
      expect(screen.getByText('Update Email Address')).toBeInTheDocument();
      const emailInput = screen.getByLabelText('Email Address');
      expect(emailInput).toHaveValue('test@example.com');
    });
  });
  
  it('should load unmasked phone when opening phone dialog.wip', async () => {
    renderWithProviders(<CommunicationPreferences guestId="123" />);

    // Find and click edit buttons
    const editButtons = screen.getAllByRole('button', { name: '' });
    const phoneEditButton = editButtons[1]; // Second edit button is for phone
    
    // Click phone edit button
    fireEvent.click(phoneEditButton);
    
    // Check that the phone query refetch was called
    expect(mockRefetch).toHaveBeenCalled();
    
    // Wait for dialog to appear with correct phone value
    await waitFor(() => {
      expect(screen.getByText('Update Phone Number')).toBeInTheDocument();
      const phoneInput = screen.getByLabelText('Phone Number');
      expect(phoneInput).toHaveValue('555-123-7890');
    });
  });
});

describe('User conditions display.wip', () => {
  // Test for only showing prefs for current user and beta tester features
  
  it('should only show preferences for current user (has auth0Id).wip', () => {
    // Override the default mock for this specific test
    jest.resetModules();
    jest.mock('@/store/family', () => ({
      guestSelector: () => ({
        guestId: '123',
        firstName: 'Test',
        auth0Id: 'auth0|123', // Has auth0Id - is current user
        preferences: {
          notificationPreference: [NotificationPreferenceEnum.Email],
        },
        email: {
          maskedValue: 't***@e******.com',
          verified: true,
        },
        phone: {
          maskedValue: '***-***-7890',
          verified: false,
        },
      }),
      useFamily: () => [
        null,
        {
          updateFamilyGuestCommunicationPreference: jest.fn(),
          updateFamilyGuestEmail: jest.fn(),
          updateFamilyGuestPhone: jest.fn(),
          patchFamilyMutation: { isPending: false },
          getFamilyUnitQuery: { isFetching: false },
        },
      ],
    }), { virtual: true });
    
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // Should show preferences UI
    expect(screen.getByText('Choose how you'd like to receive updates about the wedding.')).toBeInTheDocument();
  });

  it('should not show anything for other users (no auth0Id).wip', () => {
    // Override the default mock for this specific test
    jest.resetModules();
    jest.mock('@/store/family', () => ({
      guestSelector: () => ({
        guestId: '123',
        firstName: 'Test',
        auth0Id: '', // Empty auth0Id - not current user
        preferences: {
          notificationPreference: [NotificationPreferenceEnum.Email],
        },
        email: {
          maskedValue: 't***@e******.com',
          verified: true,
        },
        phone: {
          maskedValue: '***-***-7890',
          verified: false,
        },
      }),
      useFamily: () => [
        null,
        {
          updateFamilyGuestCommunicationPreference: jest.fn(),
          updateFamilyGuestEmail: jest.fn(),
          updateFamilyGuestPhone: jest.fn(),
          patchFamilyMutation: { isPending: false },
          getFamilyUnitQuery: { isFetching: false },
        },
      ],
    }), { virtual: true });
    
    const { container } = renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // Component should not render anything
    expect(container).toBeEmptyDOMElement();
  });

  it('should show beta testing options for users with BetaTester role.wip', () => {
    // Override the default mock for this specific test
    jest.resetModules();
    
    // Mock isBetaTester function
    jest.mock('@/utils/roles', () => ({
      isBetaTester: jest.fn().mockReturnValue(true)
    }));
    
    jest.mock('@/store/family', () => ({
      guestSelector: () => ({
        guestId: '123',
        firstName: 'Test',
        auth0Id: 'auth0|123', // Has auth0Id - is current user
        roles: ['Guest', 'BetaTester'],
        preferences: {
          notificationPreference: [NotificationPreferenceEnum.Email],
        },
        email: {
          maskedValue: 't***@e******.com',
          verified: true,
        },
        phone: {
          maskedValue: '***-***-7890',
          verified: false,
        },
      }),
      useFamily: () => [
        null,
        {
          updateFamilyGuestCommunicationPreference: jest.fn(),
          updateFamilyGuestEmail: jest.fn(),
          updateFamilyGuestPhone: jest.fn(),
          patchFamilyMutation: { isPending: false },
          getFamilyUnitQuery: { isFetching: false },
        },
      ],
    }), { virtual: true });
    
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // Should show beta testing options
    expect(screen.getByText('Beta Testing Options')).toBeInTheDocument();
    expect(screen.getByText('Opt-in to beta features')).toBeInTheDocument();
  });
});

describe('Verification section display conditions.wip', () => {
  // Create custom test mocks for different verification states
  
  it('should show verification section when email opted in but not verified.wip', () => {
    // Override the default mock for this specific test
    jest.resetModules();
    jest.mock('@/store/family', () => ({
      guestSelector: () => ({
        guestId: '123',
        firstName: 'Test',
        preferences: {
          notificationPreference: [NotificationPreferenceEnum.Email],
        },
        email: {
          maskedValue: 't***@e******.com',
          verified: false,
        },
        phone: {
          maskedValue: '***-***-7890',
          verified: false,
        },
      }),
      useFamily: () => [
        null,
        {
          updateFamilyGuestCommunicationPreference: jest.fn(),
          updateFamilyGuestEmail: jest.fn(),
          updateFamilyGuestPhone: jest.fn(),
          patchFamilyMutation: { isPending: false },
          getFamilyUnitQuery: { isFetching: false },
        },
      ],
    }), { virtual: true });
    
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // Verify section should be shown for email
    expect(screen.getByText(/SEND VERIFY CODE TO EMAIL/i)).toBeInTheDocument();
  });

  it('should show verification section when text opted in but not verified.wip', () => {
    // Override the default mock for this specific test
    jest.resetModules();
    jest.mock('@/store/family', () => ({
      guestSelector: () => ({
        guestId: '123',
        firstName: 'Test',
        preferences: {
          notificationPreference: [NotificationPreferenceEnum.Text],
        },
        email: {
          maskedValue: 't***@e******.com',
          verified: false,
        },
        phone: {
          maskedValue: '***-***-7890',
          verified: false,
        },
      }),
      useFamily: () => [
        null,
        {
          updateFamilyGuestCommunicationPreference: jest.fn(),
          updateFamilyGuestEmail: jest.fn(),
          updateFamilyGuestPhone: jest.fn(),
          patchFamilyMutation: { isPending: false },
          getFamilyUnitQuery: { isFetching: false },
        },
      ],
    }), { virtual: true });
    
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // Verify section should be shown for phone
    expect(screen.getByText(/SEND VERIFY CODE TO PHONE/i)).toBeInTheDocument();
  });

  it('should show verification section for both when both opted in and neither verified.wip', () => {
    // Override the default mock for this specific test
    jest.resetModules();
    jest.mock('@/store/family', () => ({
      guestSelector: () => ({
        guestId: '123',
        firstName: 'Test',
        preferences: {
          notificationPreference: [NotificationPreferenceEnum.Email, NotificationPreferenceEnum.Text],
        },
        email: {
          maskedValue: 't***@e******.com',
          verified: false,
        },
        phone: {
          maskedValue: '***-***-7890',
          verified: false,
        },
      }),
      useFamily: () => [
        null,
        {
          updateFamilyGuestCommunicationPreference: jest.fn(),
          updateFamilyGuestEmail: jest.fn(),
          updateFamilyGuestPhone: jest.fn(),
          patchFamilyMutation: { isPending: false },
          getFamilyUnitQuery: { isFetching: false },
        },
      ],
    }), { virtual: true });
    
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // Both verify buttons should be shown
    expect(screen.getByText(/SEND VERIFY CODE TO EMAIL/i)).toBeInTheDocument();
    expect(screen.getByText(/SEND VERIFY CODE TO PHONE/i)).toBeInTheDocument();
  });

  it('should not show verification section when both opted in but both verified.wip', () => {
    // Override the default mock for this specific test
    jest.resetModules();
    jest.mock('@/store/family', () => ({
      guestSelector: () => ({
        guestId: '123',
        firstName: 'Test',
        preferences: {
          notificationPreference: [NotificationPreferenceEnum.Email, NotificationPreferenceEnum.Text],
        },
        email: {
          maskedValue: 't***@e******.com',
          verified: true,
        },
        phone: {
          maskedValue: '***-***-7890',
          verified: true,
        },
      }),
      useFamily: () => [
        null,
        {
          updateFamilyGuestCommunicationPreference: jest.fn(),
          updateFamilyGuestEmail: jest.fn(),
          updateFamilyGuestPhone: jest.fn(),
          patchFamilyMutation: { isPending: false },
          getFamilyUnitQuery: { isFetching: false },
        },
      ],
    }), { virtual: true });
    
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // No verify buttons should be shown
    expect(screen.queryByText(/SEND VERIFY CODE/i)).not.toBeInTheDocument();
  });

  it('should not show verification section when neither opted in.wip', () => {
    // Override the default mock for this specific test
    jest.resetModules();
    jest.mock('@/store/family', () => ({
      guestSelector: () => ({
        guestId: '123',
        firstName: 'Test',
        preferences: {
          notificationPreference: [],
        },
        email: {
          maskedValue: 't***@e******.com',
          verified: false,
        },
        phone: {
          maskedValue: '***-***-7890',
          verified: false,
        },
      }),
      useFamily: () => [
        null,
        {
          updateFamilyGuestCommunicationPreference: jest.fn(),
          updateFamilyGuestEmail: jest.fn(),
          updateFamilyGuestPhone: jest.fn(),
          patchFamilyMutation: { isPending: false },
          getFamilyUnitQuery: { isFetching: false },
        },
      ],
    }), { virtual: true });
    
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // No verify buttons should be shown
    expect(screen.queryByText(/SEND VERIFY CODE/i)).not.toBeInTheDocument();
  });
});