import { render } from '@testing-library/react';
import { ApiContext, useApiContext } from '@/context/ApiContext';
import { mockContextProvider } from '@/../test-utils/mockContextProviders';

jest.mock('@auth0/auth0-react', () => ({
  useApiContext: jest.fn(),
}));


describe('ApiContext', () => {
  it('should work', () => {
    mockContextProvider<ReturnType<typeof useApiContext>>({
      getTokenFunc: jest.fn(),
    });
    const { getByTestId } = render(
      <ApiContext>
        <div data-testid="apiContext" />
      </ApiContext>,
    );
    expect(getByTestId('apiContext')).toBeTruthy();
  });
});