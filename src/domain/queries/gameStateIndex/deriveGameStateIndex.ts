import type { GameState, GameStateIndex } from '@game';
import { listPiecePlaces } from './listPiecePlaces';

/**
 * The index a game state's record calls for: where every unit and commander
 * is, read from the board, the reserve, the routed units and the lost
 * commanders. The state's own `index` is ignored, as this is what it must
 * equal.
 *
 * Play never calls this: each writer that moves a piece overwrites that
 * piece's one entry. It is the measure a full state read from outside is
 * checked against, and how a spec that builds a whole board at once gets the
 * index that board calls for.
 *
 * A commander not yet placed at setup is in reserve, as is any commander the
 * record puts nowhere. A piece held in two places is never a whole state, and
 * the check refuses it; here it is filed where the board says, as the board
 * is listed last and the last place listed stands, so that this always has
 * an answer.
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

  // Every piece filed where the record puts it.
  return index;
}
