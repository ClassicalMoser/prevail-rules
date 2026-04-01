import type { Board, UnitWithPlacement } from '@entities';
import type { MoveUnitEvent } from '@events';
import type { GameStateWithBoard } from '@game';
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
  event: MoveUnitEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const originalUnitWithPlacement = event.unit;
  const newUnitWithPlacement = {
    ...originalUnitWithPlacement,
    placement: event.to,
  };

  // Remove unit from source space, then add at destination
  const removedUnitBoard = removeUnitFromBoard<TBoard>(
    state.boardState,
    originalUnitWithPlacement as UnitWithPlacement<TBoard>,
  );
  const newBoard = addUnitToBoard<TBoard>(
    removedUnitBoard,
    newUnitWithPlacement as UnitWithPlacement<TBoard>,
  );

  const newGameState = updateBoardState(state, newBoard);
  return newGameState;
}
