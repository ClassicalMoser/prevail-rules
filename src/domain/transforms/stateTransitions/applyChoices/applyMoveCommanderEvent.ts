import type { Board, BoardCoordinate } from '@entities';
import type { MoveCommanderEvent } from '@events';
import type { GameState, MoveCommandersPhaseState } from '@game';
import { getMoveCommandersPhaseState } from '@queries';
import {
  addCommanderToBoard,
  removeCommanderFromBoard,
  updateBoardState,
  updatePhaseState,
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
export function applyMoveCommanderEvent<TBoard extends Board>(
  event: MoveCommanderEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = getMoveCommandersPhaseState(state);
  const side = event.player;
  const originalCoordinate = event.from as BoardCoordinate<TBoard>;
  const newCoordinate = event.to as BoardCoordinate<TBoard>;

  // Remove commander from source space, then add at destination
  const removedCommanderBoard = removeCommanderFromBoard<TBoard>(
    state.boardState,
    originalCoordinate,
    side,
  );
  const addedCommanderBoard = addCommanderToBoard<TBoard>(
    removedCommanderBoard,
    side,
    newCoordinate,
  );

  // Advance step: first commander -> second, second -> complete
  const newStep: MoveCommandersPhaseState['step'] =
    currentPhaseState.step === 'moveFirstCommander'
      ? 'moveSecondCommander'
      : 'complete';
  const newPhaseState: MoveCommandersPhaseState = {
    ...currentPhaseState,
    step: newStep,
  };

  const stateWithBoard = updateBoardState(state, addedCommanderBoard);
  const newGameState = updatePhaseState(stateWithBoard, newPhaseState);
  return newGameState;
}
