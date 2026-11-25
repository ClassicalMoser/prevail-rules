import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative } from '@transforms';

import { hasInitiative } from './hasInitiative';

describe('hasInitiative function', () => {
  it('names the side holding the initiative as the first player, and only that side', () => {
    // Black has taken the initiative with the lower card this round (§4.1.3).
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );

    // Black acts first in every phase that has an order (§4.1.5) …
    expect(hasInitiative(state, 'black')).toBe(true);
    // … and White is the second player.
    expect(hasInitiative(state, 'white')).toBe(false);
  });
});
