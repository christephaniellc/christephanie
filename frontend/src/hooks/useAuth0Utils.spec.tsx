import { renderHook } from '@testing-library/react';
import { useAuth0Utils } from '@/hooks/useAuth0Utils';
import { useAuth0 } from '@auth0/auth0-react';
import { mockUseAuth0 } from '../../test-utils/mockContextProviders';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

describe('useAuth0Utils', () => {
  beforeEach(() => {
    mockUseAuth0({ loginWithPopup: jest.fn() });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should attach the users guestId when it makes a call to auth0 to log in', () => {
    const { result } = renderHook(() => useAuth0Utils());
    result.current.loginUser('1234');
    expect(useAuth0).toHaveBeenCalled();
  });
});