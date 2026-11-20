import type { Board, Coordinate, GridPosition } from '@entities';
import { coordinateLayoutMap } from '@entities';

/**
 * The space at a row and column on this board, or `undefined` when that
 * position lies off it.
 *
 * Geometry works in rows and columns: a step adds a facing's deltas to a
 * space's position (`findForwardSpace`), and a deployment belt is a band of
 * rows less its outer columns (`getSetupZoneCoordinates`). This turns the
 * position back into the space the rules name. Off the board is an ordinary
 * answer, a board edge at a unit's front, so this is total.
 *
 * @param board - The board whose size lays out its spaces
 * @param position - The row and column, counted from 0
 * @returns The space there, or `undefined` past an edge
 */
export function findCoordinateAtPosition(
  board: Board,
  position: GridPosition,
): Coordinate | undefined {
  // This size's depth and frontage bound the board; its spaces are listed
  // row by row, each row as long as the frontage.
  const { depth, frontage, coordinates } = coordinateLayoutMap[board.boardType];
  const { row, column } = position;

  // Past the first or last row, or the first or last column, there is no
  // space. The column is checked on its own: in the list, one past a row's
  // last column is the next row's first space, which is not beside it.
  const offBoard = row < 0 || row >= depth || column < 0 || column >= frontage;
  if (offBoard) {
    return undefined;
  }

  // The size lists its spaces row by row, so a position's space sits at its
  // row times the frontage, plus its column.
  const coordinate = coordinates[row * frontage + column];
  return coordinate;
}
