import type { Board, GameState, RetreatState } from '@entities';
import type { ResolveRetreatEvent } from '@events';
import { findRetreatState } from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateRetreatState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRetreatEvent to the game state.
 * Moves the retreating unit from startingPosition to finalPosition on the board.
 * Marks the retreat state as completed.
 *
 * @param event - The resolve retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the unit moved and retreat state marked as completed
 */
export function applyResolveRetreatEvent<TBoard extends Board>(
  event: ResolveRetreatEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  // Move the unit on the board
  const removedUnitBoard = removeUnitFromBoard<TBoard>(
    state.boardState,
    event.startingPosition,
  );
  const addedUnitBoard = addUnitToBoard<TBoard>(
    removedUnitBoard,
    event.finalPosition,
  );

  // Get the current retreat state to update
  const retreatingPlayer = event.startingPosition.unit.playerSide;
  const currentRetreatState = findRetreatState(state, retreatingPlayer);

  // Mark retreat as completed
  const newRetreatState: RetreatState<TBoard> = {
    ...currentRetreatState,
    completed: true,
  };

  // Update the retreat state using the pure transform
  const stateWithUpdatedRetreat = updateRetreatState(state, newRetreatState);

  // Return with board updated
  return {
    ...stateWithUpdatedRetreat,
    boardState: addedUnitBoard,
  };
}
