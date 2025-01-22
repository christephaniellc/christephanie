import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WelcomePageStepper from './WelcomePageStepper';
describe('<VerticalStepper />', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<WelcomePageStepper />);
    const verticalStepper = getByTestId('vertical-stepper');
    expect(verticalStepper).toBeInTheDocument();
  });
});