import { render } from '@testing-library/react';
import { ApiContext, ApiContextProvider, useApiContext } from '@/context/ApiContext';

jest.mock('@auth0/auth0-react', () => ({
  useApiContext: jest.fn(),
}));


describe('ApiContext', () => {
  it('should work', () => {
    (useApiContext as jest.Mock).mockReturnValue({
      getTokenFunc: jest.fn(),
    });
    const { getByTestId } = render(
      <ApiContextProvider>
        <div data-testid="apiContext" />
      </ApiContextProvider>,
    );
    expect(getByTestId('apiContext')).toBeTruthy();
  });
});