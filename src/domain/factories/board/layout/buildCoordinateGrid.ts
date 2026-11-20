import type { Coordinate, CoordinateLayout } from '@entities';

/**
 * Every space of one board size, with where each sits on the grid, worked
 * out once for that size.
 *
 * Geometry asks two questions all game long: which space lies one step from
 * here, and how many spaces apart two spaces are. Both need a space's row and
 * column as numbers, and a space back from them. Reading those off the name
 * each time builds and splits strings on every step a mover or a bot weighs,
 * so the answers are tabled here instead. The board's size is the only input;
 * nothing in play changes them.
 */
export interface CoordinateGrid {
  /** Every space on the board, row by row from the first row, as the layout lists them. */
  readonly coordinates: readonly Coordinate[];
  /** Each space's row, counted from 0. A space not on this board is absent. */
  readonly rowIndexByCoordinate: ReadonlyMap<Coordinate, number>;
  /** Each space's column, counted from 0. A space not on this board is absent. */
  readonly columnIndexByCoordinate: ReadonlyMap<Coordinate, number>;
  /** The space at each row and column: `coordinateRows[row][column]`. */
  readonly coordinateRows: readonly (readonly Coordinate[])[];
}

/**
 * Tables one board size's spaces from its layout. Built once per size, beside
 * the layouts themselves, and read by `getCoordinateGrid`.
 *
 * @param layout - The size's rows and columns
 * @returns Every space of that size, with its row and column both ways
 */
export function buildCoordinateGrid(layout: CoordinateLayout): CoordinateGrid {
  const coordinates: Coordinate[] = [];
  const rowIndexByCoordinate = new Map<Coordinate, number>();
  const columnIndexByCoordinate = new Map<Coordinate, number>();
  const coordinateRows: Coordinate[][] = [];

  // Walk the board row by row, as `getBoardCoordinates` always listed it, so
  // any reader that takes the first match in that order still finds the same
  // space first.
  layout.rowLetters.forEach((row, rowIndex) => {
    const coordinateRow: Coordinate[] = [];

    // Name each space once, from the vocabulary every board shares, and note
    // its row and column so geometry never has to read them off the name.
    layout.columnNumbers.forEach((column, columnIndex) => {
      const coordinate = layout.createCoordinate(row, column);
      coordinates.push(coordinate);
      coordinateRow.push(coordinate);
      rowIndexByCoordinate.set(coordinate, rowIndex);
      columnIndexByCoordinate.set(coordinate, columnIndex);
    });

    // The row in column order, so a step's arithmetic lands on its space by
    // index.
    coordinateRows.push(coordinateRow);
  });

  // The tables are fixed for this size: nothing in play adds or moves a space.
  const grid: CoordinateGrid = {
    columnIndexByCoordinate,
    coordinateRows,
    coordinates,
    rowIndexByCoordinate,
  };
  return grid;
}
