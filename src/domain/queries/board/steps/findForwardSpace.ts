import type { Board, UnitFacing } from '@entities';
import type { Coordinate } from '@ruleValues';
import { unitFacings } from '@entities';
import { boardRowLetters, coordinateLayoutMap } from '@ruleValues';
import { getColumnDelta, getRowDelta } from '../deltas';
import { findCoordinateAtPosition } from '../findCoordinateAtPosition';
import { findGridPosition } from '../findGridPosition';

const facings = new Set<UnitFacing>(unitFacings);

/**
 * Words why a coordinate is not a space on this board: a name not shaped
 * row-column, a row this size lacks, or a column it lacks.
 *
 * @param board - The board the coordinate was asked of
 * @param coordinate - The coordinate the layout does not list
 * @throws Always, naming the part that is wrong
 */
function throwInvalidCoordinate(board: Board, coordinate: Coordinate): never {
  // Coordinates are formatted as "Row-Column" (e.g., "E-5" = row E, column 5)
  const parts = coordinate.split('-');
  if (parts.length !== 2) {
    throw new Error(`Invalid coordinate: ${coordinate}`);
  }
  const [inputRow = '', inputColumn = ''] = parts;

  // A row only a larger board has. A row is this board's if its letter is
  // among the first `depth` row letters. The labels are read as plain
  // strings, since the part being checked may be no label at all.
  const { depth } = coordinateLayoutMap[board.boardType];
  const rowLetters: readonly string[] = boardRowLetters;
  const row = rowLetters.indexOf(inputRow);
  if (row === -1 || row >= depth) {
    throw new Error(`Invalid row: ${inputRow}`);
  }

  // The board lacks the space and its row is this board's, so the column is
  // the part of the name that is wrong.
  throw new Error(`Invalid column: ${inputColumn}`);
}

/**
 * One step forward from `coordinate` along `facing`, using the active board’s
 * coordinate layout (`board.boardType`).
 *
 * A unit only ever steps the way it faces (§5.1.3), so this is every step a
 * move takes, and every neighbourhood the board readers build is one of
 * these per direction (`getSpacesInDirections`). Off the board is an
 * ordinary answer: a board edge in front of the unit.
 *
 * Returns `undefined` when that step would leave the board. Throws on a malformed
 * coordinate string, a row/column outside this board’s layout, or an invalid facing.
 */
export function findForwardSpace(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Coordinate | undefined {
  // Its row and column, read from its whole name, so a step costs a lookup
  // and some arithmetic rather than splitting the name and naming the next
  // space afresh. A mover's paths take many steps.
  const position = findGridPosition(board, coordinate);

  // A space not on this board is a caller's mistake. Say which part of its
  // name is wrong, as the step always has.
  if (position === undefined) {
    throwInvalidCoordinate(board, coordinate);
  }

  // Validate facing (defensive check for invalid facings that bypass TypeScript)
  if (!facings.has(facing)) {
    throw new Error(`Invalid facing: ${facing}`);
  }

  // Calculate the new position by applying the movement deltas
  const forward = {
    column: position.column + getColumnDelta(facing),
    row: position.row + getRowDelta(facing),
  };

  // A step past the last row or column leaves the board: there is no space
  // there, which is an ordinary answer (a board edge at a unit's front).
  const forwardSpace = findCoordinateAtPosition(board, forward);

  // The space one step ahead, or nothing at the board edge.
  return forwardSpace;
}
