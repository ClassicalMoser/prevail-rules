import type { Coordinate } from './boardCoordinates';
import type { BoardType } from './boardSizes';
import { boardColumnNumbers, boardRowLetters } from './boardLabels';

/**
 * A board size (§2.1.3): how deep it is, how wide, and the spaces that makes.
 * Depth is measured between the players, in rows; frontage runs across, in
 * columns.
 */
export interface CoordinateLayout {
  /** Rows, north to south: the first this many row letters. */
  readonly depth: number;
  /** Columns, west to east: the first this many column numbers. */
  readonly frontage: number;
  /**
   * Every space on a board of this size, row by row from the first row, each
   * row column by column. The space at a row and column is at place
   * `row × frontage + column`. The board's own spaces are exactly these.
   */
  readonly coordinates: readonly Coordinate[];
}

/** One layout for each board size. */
export type CoordinateLayoutMap = Record<BoardType, CoordinateLayout>;

/**
 * A size's layout from its depth and frontage: the first rows and columns of
 * the board's labels, and the spaces they make.
 *
 * @param depth - Rows, between the players
 * @param frontage - Columns, across
 * @returns The size's depth, frontage and spaces
 */
function constructLayout(depth: number, frontage: number): CoordinateLayout {
  // The size takes the first rows and columns of the labels: every size
  // labels from the north-west corner, so this is what makes the sizes nest.
  const rows = boardRowLetters.slice(0, depth);
  const columns = boardColumnNumbers.slice(0, frontage);

  // Its spaces, row by row from the north edge, each row column by column
  // from the west edge, named by letter and number.
  const coordinates = rows.flatMap((row) =>
    columns.map((column): Coordinate => `${row}-${column}`),
  );

  // The size, and the spaces a board of that size holds.
  const layout: CoordinateLayout = { coordinates, depth, frontage };
  return layout;
}

/**
 * Each board size's layout, depth × frontage as §2.1.3 gives them. A reader
 * with a board indexes it by the board's size:
 * `coordinateLayoutMap[board.boardType]`.
 */
export const coordinateLayoutMap: CoordinateLayoutMap = {
  // The large board, 24 deep and 36 wide: every label, the widest size.
  large: constructLayout(24, 36),
  // The small board, 8 deep and 12 wide.
  small: constructLayout(8, 12),
  // The standard board, 12 deep and 18 wide.
  standard: constructLayout(12, 18),
};
