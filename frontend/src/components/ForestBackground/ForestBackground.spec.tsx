import { render } from '@testing-library/react';
import ForestBackground from '@/components/ForestBackground/ForestBackground';
import { RecoilRoot } from 'recoil';

describe('<ForestBackground />.locked', () => {
  it('should render without crashing.locked', () => {
    render(
      <RecoilRoot>
        <ForestBackground />
      </RecoilRoot>,
    );
  });
  it.todo('renders tree clusters with larger icons at the bottom and smaller icons at the top (perspective depth)');
  it.todo('uses flexbox layout to distribute clusters across the available space');
  it.todo('displays stick figure icons only when figureCount is provided and > 0');
  it.todo('groups some stick figures around a fire when multiple attendees are present');
  it.todo('limits the number of stick figures to 2 on very large screens (dense forest mode)');
  it.todo('applies color from the Recoil palette to icons, changing hues when the palette/state changes');
});