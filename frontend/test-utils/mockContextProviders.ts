import { useAuth0 } from '@auth0/auth0-react';

const mockUseAuth0 = (returnValue: Partial<ReturnType<typeof useAuth0>>) => {
  (useAuth0 as jest.Mock).mockReturnValue(returnValue);
};

export { mockUseAuth0 };