import type {
  Board,
  BoardCoordinate,
  GameState,
  MoveCommandersPhaseState,
} from '@entities';
import type { MoveCommanderEvent } from '@events';
import { getMoveCommandersPhaseState } from '@queries';
import {
  addCommanderToBoard,
  removeCommanderFromBoard,
} from '@transforms/pureTransforms';

/**
 * Applies a MoveCommanderEvent to the game state.
 * Moves a commander from one board position to another.
 * Advances the phase step based on which commander was moved.
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
  const originalCoordinate: BoardCoordinate<TBoard> = event.from;
  const newCoordinate: BoardCoordinate<TBoard> = event.to;

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

  // Determine new step based on current step
  let newStep: MoveCommandersPhaseState['step'];
  if (currentPhaseState.step === 'moveFirstCommander') {
    newStep = 'moveSecondCommander';
  } else if (currentPhaseState.step === 'moveSecondCommander') {
    newStep = 'complete';
  } else {
    throw new Error(
      `Invalid move commanders phase step: ${currentPhaseState.step}`,
    );
  }

  const newPhaseState: MoveCommandersPhaseState = {
    ...currentPhaseState,
    step: newStep,
  };

  return {
    ...state,
    boardState: addedCommanderBoard,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
