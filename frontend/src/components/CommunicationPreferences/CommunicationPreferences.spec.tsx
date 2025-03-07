import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommunicationPreferences from './CommunicationPreferences';
import { RecoilRoot } from 'recoil';
import { NotificationPreferenceEnum } from '@/types/api';
import { ApiContext } from '@/context/ApiContext';

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

describe('Status indicator chips [ wip]', () => {
  it('should show "Active" chip for communication that is opted in but not verified [ wip]', () => {
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
    
    // "Active" chip should be shown for email
    expect(screen.getByText("Active")).toBeInTheDocument();
    // Should not show "Verified" chip
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
  });

  it('should show "Verified" chip for verified communication [ wip]', () => {
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
    
    // "Verified" chip should be shown for email
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it('should show "Inactive" chip for non-opted in communication [ wip]', () => {
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
    
    // "Inactive" chip should be shown
    expect(screen.getAllByText("Inactive").length).toBeGreaterThan(0);
  });
});

describe('Status modal [ wip]', () => {
  beforeEach(() => {
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
  });

  it('should open status modal when clicking on Active chip [ wip]', async () => {
    renderWithProviders(<CommunicationPreferences guestId="123" />);
    
    // Find and click the Active chip
    const activeChip = screen.getByText("Active");
    fireEvent.click(activeChip);
    
    // Status modal should appear with email content
    await waitFor(() => {
      expect(screen.getByText("Email Status")).toBeInTheDocument();
      expect(screen.getByText(/your email is not verified/i, { exact: false })).toBeInTheDocument();
    });
  });

  it('should send verification code when clicking Send Verification Code in the modal [ wip]', async () => {
    const apiContext = {
      validateEmailMutation: {
        mutate: jest.fn((params, callbacks) => {
          if (callbacks && callbacks.onSuccess) {
            callbacks.onSuccess();
          }
        }),
      },
      validatePhoneMutation: {
        mutate: jest.fn(),
      },
      getMaskedValueQuery: () => mockEmailQuery,
    };
    
    render(
      <RecoilRoot>
        <ApiContext.Provider value={apiContext as any}>
          <CommunicationPreferences guestId="123" />
        </ApiContext.Provider>
      </RecoilRoot>
    );
    
    // Find and click the Active chip
    const activeChip = screen.getByText("Active");
    fireEvent.click(activeChip);
    
    // Find and click the Send Verification Code button in the modal
    await waitFor(() => {
      const sendButton = screen.getByText("Send Verification Code");
      fireEvent.click(sendButton);
    });
    
    // Verify that the mutation was called
    expect(apiContext.validateEmailMutation.mutate).toHaveBeenCalled();
  });
});