import { createEmptyGameState } from '@factories';

import { updateCurrentInitiative } from './updateCurrentInitiative';

/**
 * The side holding the initiative is the first player for the round
 * (§4.1.5). Only that changes.
 */
describe('updateCurrentInitiative function', () => {
  it('hands the initiative to the given side and changes nothing else', () => {
    // White holds the initiative going into round one (§3.3.2).
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );

    // Black plays the lower card and takes it (§4.1.3).
    const updated = updateCurrentInitiative(state, 'black');

    // Black holds it now; the round, the board and the cards are the very
    // same.
    expect(updated.currentInitiative).toBe('black');
    expect(updated.currentRoundState).toBe(state.currentRoundState);
    expect(updated.boardState).toBe(state.boardState);
    expect(updated.cardState).toBe(state.cardState);
  });
});
