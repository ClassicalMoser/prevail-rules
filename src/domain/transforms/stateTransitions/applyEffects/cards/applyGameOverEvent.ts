import type { GameOverEvent } from '@events';
import type { GameState } from '@game';
import { updateWinner } from '@transforms/pureTransforms';

/**
 * Applies a GameOverEvent by assigning {@link GameState.winner}.
 * Does not advance phase state — the game is finished.
 *
 * @param event - The game over event (winner baked by procedure)
 * @param state - The current game state
 * @returns A new game state with winner set
 */
export function applyGameOverEvent<S extends GameState>(
  event: GameOverEvent,
  state: S,
): S {
  return updateWinner(state, event.winner);
}
