import type { MoveCommanderEvent } from '@events';
import type { GameState } from '@game';
import {
  getMoveCommandersPhaseState,
  getMoveCommandersStepAfter,
} from '@queries';
import {
  moveCommanderOnBoard,
  updateBoardState,
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
  const currentPhaseState = getMoveCommandersPhaseState(state);
  const side = event.player;
  const originalCoordinate = event.from;
  const newCoordinate = event.to;

  const addedCommanderBoard = moveCommanderOnBoard(
    state.boardState,
    side,
    originalCoordinate,
    newCoordinate,
  );

  // The second player moves next; after the second, the phase is done
  // (§4.2.1). A fallen commander's turn is passed over by its own effect.
  const newStep = getMoveCommandersStepAfter(currentPhaseState.step);
  const stateWithBoard = updateBoardState(state, addedCommanderBoard);
  const newGameState = updateMoveCommandersStep(stateWithBoard, newStep);
  return newGameState;
}
