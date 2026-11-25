import type { SkipLostCommanderMoveEvent } from '@events';
import type { GameState } from '@game';
import {
  getMoveCommandersPhaseState,
  getMoveCommandersStepAfter,
} from '@queries';
import { updateMoveCommandersStep } from '@transforms/pureTransforms';

/**
 * Applies a SkipLostCommanderMoveEvent: the player whose turn it is has no
 * commander to move (§4.2.8), so the turn passes on as a move would, to the
 * second player's or to the end of the phase (§4.2.1).
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The current game state
 * @returns A new game state on the next Move Commanders step
 */
export function applySkipLostCommanderMoveEvent<S extends GameState>(
  _event: SkipLostCommanderMoveEvent,
  state: S,
): S {
  // The turn passes on with nothing moved.
  // The turn being passed over is whichever the phase is on; the board and
  // the lost commander's record stay as they are.
  const { step } = getMoveCommandersPhaseState(state);

  // The same step a move would have led to: the second player's turn, or the
  // end of the phase (§4.2.1).
  const next = getMoveCommandersStepAfter(step);
  const passed = updateMoveCommandersStep(state, next);

  // The turn passed on.
  return passed;
}
