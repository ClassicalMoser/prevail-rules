import type { GameState, GameStateIndex } from '@game';
import { listPiecePlaces } from './listPiecePlaces';

/**
 * The index a game state's record calls for: where every unit and commander
 * is, read from the board, the reserve, the routed units and the lost
 * commanders. The state's own `index` is ignored, as this is what it must
 * equal.
 *
 * Every write to the board or to those lists sets the index from this, and a
 * full state read from outside is refused unless its index equals this, so
 * there is one way to work the index out.
 *
 * A commander not yet placed at setup is in reserve, as is any commander the
 * record puts nowhere. A piece held in two places, which only happens for a
 * moment within a write, is where the board says it is: the board is listed
 * last, and the last place listed stands.
 *
 * @param state - The game whose index to work out
 * @returns The index its record calls for
 */
export function deriveGameStateIndex(state: GameState): GameStateIndex {
  // Every commander begins in reserve until the record puts it somewhere.
  const index: GameStateIndex = {
    commanders: { black: 'reserved', white: 'reserved' },
    units: {},
  };

  // File each place in turn; a later place for the same piece overwrites.
  for (const place of listPiecePlaces(state)) {
    if (place.piece === 'unit') {
      index.units[place.key] = place.entry;
    } else {
      index.commanders[place.side] = place.entry;
    }
  }

  return index;
}
