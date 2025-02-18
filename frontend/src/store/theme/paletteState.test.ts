import { useRecoilValue, RecoilRoot } from 'recoil';
import { responseState, currentPaletteSelector, excitedPaletteAtom, pendingPaletteAtom, declinePaletteAtom } from './paletteState';

describe('paletteState Recoil atoms and selector', () => {
  it.todo('provides the excited palette when responseState is set to "excited"');
  it.todo('provides the pending palette when responseState is "pending" (default)');
  it.todo('provides the decline palette when responseState is set to "decline"');
  // We would also test that updating the palette atoms or response state causes the selector value to update.
});
