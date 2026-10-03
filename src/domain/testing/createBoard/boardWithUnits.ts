import type { Board, UnitWithPlacement } from '@entities';
import { createEmptyStandardBoard } from '@factories';
import { addUnitToBoard } from '@transforms';

/**
 * Creates a board with units at specified positions.
 * Composes the pure transform addUnitToBoard for each placement.
 *
 * @param units - Units with their placements on the board
 * @returns A standard board with the specified units placed
 */
export function createBoardWithUnits(units: UnitWithPlacement[]): Board {
  let board = createEmptyStandardBoard();
  for (const unitWithPlacement of units) {
    board = addUnitToBoard(board, unitWithPlacement);
  }
  return board;
}
