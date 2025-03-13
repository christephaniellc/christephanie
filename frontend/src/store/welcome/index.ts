import { atom, selector } from 'recoil';

// Wedding messages euphemisms array
const GETTING_MARRIED_EUPHEMISMS = [
  'are getting married',
  'are gettin\' hitched',
  'are tying the knot',
  'are signing a legal document to proclaim togetherness',
  'are joining the matrimony circus',
  'are jumping on the marriage bus',
  'are merging our hearts, bodies, and crippling debts',
  'are jumping into the love lagoon',
  'are making it legal',
  'are teaming up for some marriage stuff',
  'are tossing our hat into the marriage ring',
  'are marrying and stuff',
  'are linking up legally',
  'are signing on for the whole matrimony thing',
  'are putting rings on it',
  'are sittin in a tree',
  'would love your attendance and full attention, for a few days, max.',
  'love each other like Kanye loves Kanye',
];

// Utility function for random selection
const getRandomItem = (array: string[]) => 
  array[Math.floor(Math.random() * array.length)];

// State to store all available euphemisms
export const weddingEuphemismsState = atom<string[]>({
  key: 'weddingEuphemismsState',
  default: GETTING_MARRIED_EUPHEMISMS,
});

// Selector that returns a random euphemism
export const randomWeddingEuphemismState = selector<string>({
  key: 'randomWeddingEuphemismState',
  get: ({get}) => {
    const euphemisms = get(weddingEuphemismsState);
    return getRandomItem(euphemisms);
  },
});

// Hook for easier usage
export const useWelcome = () => {
  return {
    randomWeddingEuphemismState,
    weddingEuphemismsState,
  };
};