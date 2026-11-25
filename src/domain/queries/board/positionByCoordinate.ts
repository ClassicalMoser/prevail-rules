/**
 * Where every space sits, as a row and column counted from 0.
 *
 * Board sizes nest: the small board's row letters and column numbers are the
 * first of the standard board's, and the standard board's the first of the
 * large board's. So a space has the same row and column on every board it is
 * on, and one table serves all three sizes, read off the board's labels.
 * Whether a space is on a given board is that size's depth and frontage
 * (`coordinateLayoutMap`), which `findGridPosition` checks.
 *
 * A constant table, built once when the module loads from the labels alone
 * and never written: nothing in play changes where a space sits.
 *
 * TODO(misleading): in the rules a position is a space and a facing (§5.2.4,
 * `findPositionOfUnit`), but `GridPosition` here is a row and column only.
 * Settle by renaming the row-and-column type and its readers (`GridPosition`,
 * `findGridPosition`, `getGridPosition`, `findCoordinateAtPosition`,
 * `positionByCoordinate`) to a word that is not "position".
 */
import type { GridPosition } from '@entities';
import type { Coordinate } from '@ruleValues';
import { boardColumnNumbers, boardRowLetters } from '@ruleValues';

/** Each space's row and column, the same on every board it is on. */
export const positionByCoordinate: ReadonlyMap<Coordinate, GridPosition> =
  new Map<Coordinate, GridPosition>(
    // A row is a row letter's place in the list of row letters: A is row 0,
    // at the north edge, and each letter after it one row further south.
    boardRowLetters.flatMap((rowLetter, row) =>
      // A column is a column number's place in the list of column numbers:
      // 1 is column 0, at the west edge, and each number after it one column
      // further east.
      boardColumnNumbers.map(
        (columnNumber, column): [Coordinate, GridPosition] => [
          // The space at that row and column is named by its letter and its
          // number, as every board names it (`E-5`).
          `${rowLetter}-${columnNumber}`,
          // And it sits at that row and column, on any board that has it.
          { column, row },
        ],
      ),
    ),
  );
