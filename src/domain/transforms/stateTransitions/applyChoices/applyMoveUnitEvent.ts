/**
 * State transition for MoveUnitEvent.
 * This is a pure function that applies a unit move event to game state.
 */

import type { Board, GameState } from '@entities';
import type { MoveUnitEvent } from '@events';
import {
  addUnitToBoard,
  removeUnitFromBoard,
} from '@transforms/pureTransforms';

/**
 * Applies a MoveUnitEvent to the game state.
 * This is a pure function that returns a new game state without mutating the input.
 * Preserves the board type through the transition.
 *
 * @param event - The move unit event to apply
 * @param state - The current game state
 * @returns A new game state with the unit moved
 */
export function applyMoveUnitEvent<TBoard extends Board>(
  event: MoveUnitEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  // Get the original unit with placement and the new unit with placement
  const originalUnitWithPlacement = event.unit;
  const newUnitWithPlacement = {
    ...originalUnitWithPlacement,
    placement: event.to,
  };
  // Update the board state;
  const removedUnitBoard = removeUnitFromBoard<TBoard>(
    state.boardState,
    originalUnitWithPlacement,
  );
  const replacedUnitBoard = addUnitToBoard<TBoard>(
    removedUnitBoard,
    newUnitWithPlacement,
  );

  return {
    ...state,
    boardState: replacedUnitBoard,
  };
}
