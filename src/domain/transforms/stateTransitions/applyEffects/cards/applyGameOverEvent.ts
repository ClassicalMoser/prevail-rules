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
  // The procedure has already found the side that prevailed: the other
  // side's hand gave out, or it owed a rout it could not pay for, or it has
  // no units left (§11.1, §11.2, §11.4). Recording it is all that is left to
  // do; nothing else moves, since the battle is over.
  const finished = updateWinner(state, event.winner);

  // The finished game; the expected engine asks for nothing more from it.
  return finished;
}
