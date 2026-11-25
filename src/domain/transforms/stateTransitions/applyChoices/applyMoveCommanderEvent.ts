import type { MoveCommanderEvent } from '@events';
import type { GameState } from '@game';
import {
  getMoveCommandersPhaseState,
  getMoveCommandersStepAfter,
} from '@queries';
import {
  moveCommanderOnBoard,
  updateMoveCommandersStep,
} from '@transforms/pureTransforms';

/**
 * Applies a MoveCommanderEvent to the game state.
 * Moves a commander from one board position to another and advances the phase step.
 * Event is assumed pre-validated (moveCommanders phase, step is moveFirstCommander or moveSecondCommander).
 *
 * @param event - The move commander event to apply
 * @param state - The current game state
 * @returns A new game state with the commander moved
 */
export function applyMoveCommanderEvent<S extends GameState>(
  event: MoveCommanderEvent,
  state: S,
): S {
  // Safe type broadening because we know the event is for the board type
  // TODO(misleading): nothing here broadens a type or reads a board type. The
  // line beneath reads Phase 2's state, throwing outside it, so the step after
  // this player's turn can be found. Settle by rewording to say so.
  const currentPhaseState = getMoveCommandersPhaseState(state);
  const side = event.player;

  // The commander goes to the space chosen, from wherever it stands. Up to
  // four spaces, never into an enemy (§4.2.2, §4.2.4): validation checked the
  // space against the legal moves, so the move itself is trusted here.
  const moved = moveCommanderOnBoard(state, side, event.to);

  // The second player moves next; after the second, the phase is done
  // (§4.2.1). A fallen commander's turn is passed over by its own effect.
  const newStep = getMoveCommandersStepAfter(currentPhaseState.step);
  const newGameState = updateMoveCommandersStep(moved, newStep);

  // The commander stands on its new space, and the phase is on the next turn.
  return newGameState;
}
