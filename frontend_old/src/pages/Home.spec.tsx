import { Home } from '@/pages/Home'
import { render } from '@testing-library/react';

describe('Home', () => {
  it('should render the invitation code input when no one has signed in or registered', () => {
    const { getByTestId } = render(<Home />);
    expect(getByTestId('invitation-code')).toBeInTheDocument();
  });
});
