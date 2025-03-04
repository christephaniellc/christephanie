import { renderHook } from '@testing-library/react';
import { useQueryParamInvitationCode } from './useQueryParamInvitationCode';
import { RecoilRoot } from 'recoil';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import * as userModule from '@/store/user';
import * as notificationsModule from '@/store/notifications';

// Mock the dependencies
jest.mock('@/store/user');
jest.mock('@/store/notifications');

describe('useQueryParamInvitationCode', () => {
  const mockSetUser = jest.fn();
  const mockPushNotification = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    (userModule.useUser as jest.Mock).mockReturnValue([
      { invitationCode: '' },
      { setUser: mockSetUser }
    ]);
    
    (notificationsModule.default as jest.Mock).mockReturnValue([
      [],
      { push: mockPushNotification }
    ]);
  });

  it('should not set invitation code when query_key is not present in URL .locked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>
        <MemoryRouter initialEntries={['/']}>
          {children}
        </MemoryRouter>
      </RecoilRoot>
    );

    renderHook(() => useQueryParamInvitationCode(), { wrapper });

    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockPushNotification).not.toHaveBeenCalled();
  });

  it('should set invitation code when query_key is present in URL .locked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>
        <MemoryRouter initialEntries={['/?query_key=ABC123']}>
          {children}
        </MemoryRouter>
      </RecoilRoot>
    );

    renderHook(() => useQueryParamInvitationCode(), { wrapper });

    expect(mockSetUser).toHaveBeenCalledWith({
      invitationCode: 'ABC123'
    });
    expect(mockPushNotification).toHaveBeenCalledWith({
      message: 'Invitation code copied from URL',
      options: {
        variant: 'primary', // Now we're using our custom variant
        autoHideDuration: 4000,
      },
    });
  });

  it('should not set invitation code if query_key is empty .locked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>
        <MemoryRouter initialEntries={['/?query_key=']}>
          {children}
        </MemoryRouter>
      </RecoilRoot>
    );

    renderHook(() => useQueryParamInvitationCode(), { wrapper });

    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockPushNotification).not.toHaveBeenCalled();
  });
  
  it('should handle invitation_code parameter as well as query_key .locked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>
        <MemoryRouter initialEntries={['/?invitation_code=XYZ789']}>
          {children}
        </MemoryRouter>
      </RecoilRoot>
    );

    renderHook(() => useQueryParamInvitationCode(), { wrapper });

    expect(mockSetUser).toHaveBeenCalledWith({
      invitationCode: 'XYZ789'
    });
    expect(mockPushNotification).toHaveBeenCalledWith({
      message: 'Invitation code copied from URL',
      options: {
        variant: 'primary',
        autoHideDuration: 4000,
      },
    });
  });
  
  it('should only process the URL once to prevent duplicate notifications .locked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>
        <MemoryRouter initialEntries={['/?query_key=TEST123']}>
          {children}
        </MemoryRouter>
      </RecoilRoot>
    );

    const { rerender } = renderHook(() => useQueryParamInvitationCode(), { wrapper });
    
    // Initial render should process the URL
    expect(mockSetUser).toHaveBeenCalledTimes(1);
    expect(mockPushNotification).toHaveBeenCalledTimes(1);
    
    // Clear mocks to verify no additional calls
    mockSetUser.mockClear();
    mockPushNotification.mockClear();
    
    // Force a re-render
    rerender();
    
    // No additional calls should happen
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockPushNotification).not.toHaveBeenCalled();
  });
});