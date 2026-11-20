/**
 * Where a space sits on its board, as row and column positions counted from
 * 0: row 0 is row A, at the north edge, and column 0 is column 1, at the
 * west edge.
 *
 * Geometry counts in rows and columns: a step adds a facing's deltas to them,
 * and spaces apart is the larger of the two differences (§2.4.2). The board
 * names its spaces (`E-5`): `findGridPosition` in `@queries` gives each
 * name's position, and a size's layout lists the name at each position.
 *
 * Read-only, because the table behind `findGridPosition` hands out the same
 * position object to every reader of that space.
 */
export interface GridPosition {
  /** The row, counted from 0 at row A. */
  readonly row: number;
  /** The column, counted from 0 at column 1. */
  readonly column: number;
}
