// paletteState.ts
import { atom, selector } from 'recoil';

// Define color palettes for each response scenario
export const excitedPaletteAtom = atom<string[]>({
  key: 'excitedPalette',
  default: ['#8BC34A', '#4CAF50', '#CDDC39']  // Greens/Lime for excited (cheerful, vibrant)
});
export const pendingPaletteAtom = atom<string[]>({
  key: 'pendingPalette',
  default: ['#FFC107', '#FFEB3B', '#FFD54F']  // Yellows/Golds for pending (anticipation)
});
export const declinePaletteAtom = atom<string[]>({
  key: 'declinePalette',
  default: ['#9E9E9E', '#757575', '#BDBDBD']  // Greys for decline (muted, subdued)
});

// Atom to track current user response state
export const responseState = atom<'excited' | 'pending' | 'decline'>({
  key: 'responseState',
  default: 'pending'
});

// Selector to get the active palette based on current response
export const currentPaletteSelector = selector<string[]>({
  key: 'currentPalette',
  get: ({ get }) => {
    const response = get(responseState);
    switch(response) {
      case 'excited': return get(excitedPaletteAtom);
      case 'decline': return get(declinePaletteAtom);
      default:        return get(pendingPaletteAtom);
    }
  }
});