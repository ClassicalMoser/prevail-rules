import { createEmptyGameState } from '@factories';

import { updateWinner } from './updateWinner';

/**
 * UpdateWinner: assigns GameState.winner. Every ending names a side —
 * there is no draw in this game (§11.3).
 */
describe('updateWinner function', () => {
  it('names the side that prevailed and changes nothing else', () => {
    // A game still going: nobody has won.
    const state = createEmptyGameState('standard');

    // White's hand runs out, and black prevails (§11.1).
    const updated = updateWinner(state, 'black');

    // Black is the winner; the round, the board and the cards are the very
    // same.
    expect(updated.winner).toBe('black');
    expect(updated.currentRoundState).toBe(state.currentRoundState);
    expect(updated.boardState).toBe(state.boardState);
    expect(updated.cardState).toBe(state.cardState);
  });
});
