import { createEmptyGameState } from '@factories';
import { projectGameStateForVisibility } from '@transforms';

import { gameStateSchema } from './gameState';

/**
 * A game state says which view it is, and holds the cards that view may read.
 * The two are fixed together, so a state cannot claim to be one view while
 * carrying another's cards.
 */
describe('the game state schema', () => {
  it('accepts the authoritative state of a new game', () => {
    // A game just created, both hands in view.
    const state = createEmptyGameState('standard');

    // The full record is a game state.
    expect(gameStateSchema.safeParse(state).success).toBe(true);
  });

  it('accepts each seat’s projection of a game', () => {
    // A new game, projected for each seat and for a spectator.
    const state = createEmptyGameState('standard');

    for (const view of ['whiteSeen', 'blackSeen', 'spectator'] as const) {
      const projected = projectGameStateForVisibility(state, view);

      // Each projection is a game state, and says which view it is.
      expect(gameStateSchema.safeParse(projected).success).toBe(true);
      expect(projected.visibility).toBe(view);
    }
  });

  it('refuses a state that claims a seat’s view but holds the full record’s cards', () => {
    // Tagged as white's seat, but both hands are in view: not any view.
    const state = createEmptyGameState('standard');

    // Refused: the tag and the cards must name the same view.
    expect(
      gameStateSchema.safeParse({ ...state, visibility: 'whiteSeen' }).success,
    ).toBe(false);
  });

  it('refuses a state whose tag is missing', () => {
    // A new game with its view tag taken off.
    const { visibility: _visibility, ...untagged } =
      createEmptyGameState('standard');

    // Refused: without the tag there is no telling which view it is.
    expect(gameStateSchema.safeParse(untagged).success).toBe(false);
  });
});
