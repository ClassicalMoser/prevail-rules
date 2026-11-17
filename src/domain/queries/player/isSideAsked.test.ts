import { isSideAsked } from './isSideAsked';

describe('isSideAsked function', () => {
  it('asks each side of a choice both players make at once', () => {
    // Both choose their cards together, in secret (§4.1.1).
    expect(isSideAsked('bothPlayers', 'white')).toBe(true);
    expect(isSideAsked('bothPlayers', 'black')).toBe(true);
  });

  it('asks only the side a one-sided choice names', () => {
    // Black alone is asked, as when White's card is already face down.
    expect(isSideAsked('black', 'black')).toBe(true);
    expect(isSideAsked('black', 'white')).toBe(false);
  });
});
