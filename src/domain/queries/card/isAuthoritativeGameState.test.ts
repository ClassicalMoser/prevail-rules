import type { GameStateForVisibility } from '@game';
import { createEmptyGameState } from '@factories';
import { isAuthoritativeGameState } from './isAuthoritativeGameState';

describe('isAuthoritativeGameState function', () => {
  it('recognizes the full record, where every hand is known', () => {
    // A new game is the engine's own record, with both hands in view.
    const state = createEmptyGameState('mini');

    expect(isAuthoritativeGameState(state)).toBe(true);
  });

  it("rejects one player's view, where the other hand is hidden", () => {
    // White's seat: white's own cards in view, black's hand face down.
    const base = createEmptyGameState('mini');
    const state: GameStateForVisibility<'whiteSeen'> = {
      ...base,
      cardState: {
        visibility: 'whiteSeen',
        white: base.cardState.white,
        black: {
          awaitingPlay: null,
          burnt: [],
          discarded: [],
          inHand: ['hidden'],
          inPlay: null,
          played: [],
        },
      },
    };

    expect(isAuthoritativeGameState(state)).toBe(false);
  });
});
