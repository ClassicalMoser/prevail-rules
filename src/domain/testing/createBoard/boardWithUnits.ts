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
  // Each unit is set down in turn by the board's own writer, so a unit put
  // where another already stands engages it, as play would make it.
  let board = createEmptyStandardBoard();
  for (const unitWithPlacement of units) {
    board = addUnitToBoard(board, unitWithPlacement);
  }

  // The standard board, holding every unit given.
  return board;
}
