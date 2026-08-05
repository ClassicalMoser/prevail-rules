import type { Board } from '@entities';
import type { MoveUnitEvent } from '@events';
import type { GameStateForBoard } from '@game';
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateBoardState,
} from '@transforms/pureTransforms';

/**
 * Applies a MoveUnitEvent to the game state.
 * Removes the unit from its current space and adds it at the destination.
 * Event is assumed pre-validated (legal move, unit at event.unit.placement).
 *
 * @param event - The move unit event to apply
 * @param state - The current game state
 * @returns A new game state with the unit moved
 */
export function applyMoveUnitEvent<TBoard extends Board>(
  event: MoveUnitEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const originalUnitWithPlacement = event.unit;
  const newUnitWithPlacement = {
    ...originalUnitWithPlacement,
    placement: event.to,
  };

  // Remove unit from source space, then add at destination
  const removedUnitBoard = removeUnitFromBoard(
    state.boardState as TBoard,
    originalUnitWithPlacement,
  );
  const newBoard = addUnitToBoard(
    removedUnitBoard,
    newUnitWithPlacement,
  );

  const newGameState = updateBoardState(state, newBoard);
  return newGameState;
}
