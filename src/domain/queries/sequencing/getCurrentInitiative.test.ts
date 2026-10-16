import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative } from '@transforms';

import { getCurrentInitiative } from './getCurrentInitiative';

/**
 * The initiative side stored on the game.
 */
describe('getCurrentInitiative function', () => {
  it('returns the initiative on the game', () => {
    // An empty game starts on black. White is the value this test wrote.
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );

    expect(getCurrentInitiative(state)).toBe('white');
  });
});
