import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative } from '@transforms';

import { getCurrentInitiative } from './getCurrentInitiative';

/** The side holding the initiative is the first player for the round (§4.1.5). */
describe('getCurrentInitiative function', () => {
  it('returns the side holding the initiative', () => {
    // An empty game starts with white holding it, so black is the value this
    // test wrote.
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );

    // Black acts first this round.
    expect(getCurrentInitiative(state)).toBe('black');
  });
});
