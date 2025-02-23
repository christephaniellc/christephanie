import { render } from '@testing-library/react';
import WelcomePageStepper from './WelcomePageStepper';
describe('<Steppers />', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<WelcomePageStepper />);
    const verticalStepper = getByTestId("vertical-stepper");
    expect(verticalStepper).toBeInTheDocument();
  });
});