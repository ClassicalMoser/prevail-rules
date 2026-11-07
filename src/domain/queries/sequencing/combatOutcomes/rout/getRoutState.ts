import type { GameState, RoutState } from '@game';
import { findRoutState } from './findRoutState';

/**
 * The rout in play, for a caller that knows one must be.
 *
 * Every step that resolves a rout is sequenced after the rout was opened, so a
 * missing one there is a sequencing fault rather than a quiet state of the game.
 * Use `findRoutState` to ask whether anything is routing at all.
 *
 * @param state - The game state
 * @returns The rout in play
 * @throws Error when nothing is routing
 */
export function getRoutState(state: GameState): RoutState {
  const routState = findRoutState(state);
  if (routState === null) {
    throw new Error('No rout is in play');
  }
  return routState;
}
