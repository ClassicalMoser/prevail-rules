/**
 * Composes each board size's strict coordinate definitions (row letters, column numbers)
 * into a single object. Used in two ways: (1) as an iterator—rowLetters × columnNumbers
 * with createCoordinate—when building boards or enumerating all coordinates; (2) as
 * lookup tables for coordinate arithmetic—getRowIndex/getColumnIndex (O(1)), length, [index] for movement
 * and adjacency (e.g. getForwardSpace). The layout does not define coordinates; it
 * bundles the existing enums/constants. Boards are validated at boundaries (Zod), so
 * internal functions trust types.
 */

import type { AssertExact } from "@utils";
import type { Board } from "./board";
import type { BoardCoordinate } from "./boardCoordinates";
import type { LargeBoardCoordinate } from "./largeBoard";
import type { SmallBoardCoordinate } from "./smallBoard";
import type { StandardBoardCoordinate } from "./standardBoard";

import { z } from "zod";
import { largeBoardColumnNumbers, largeBoardRowLetters } from "./largeBoard";
import { smallBoardColumnNumbers, smallBoardRowLetters } from "./smallBoard";
import { standardBoardColumnNumbers, standardBoardRowLetters } from "./standardBoard";

function buildIndexMap(arr: readonly string[]): Map<string, number> {
  return new Map(arr.map((s, i) => [s, i]));
}

/**
 * Bundle of a board's strict row/column definitions plus createCoordinate.
 * Used to iterate the grid (build boards, list coordinates) or for coordinate
 * arithmetic (getRowIndex/getColumnIndex O(1), length, [index] in e.g. getForwardSpace).
 * Definitions live in each board's module (e.g. largeBoardRowLetters).
 */
export interface CoordinateLayout<TCoordinate extends string> {
  readonly rowLetters: readonly string[];
  readonly columnNumbers: readonly string[];
  createCoordinate: (row: string, column: string) => TCoordinate;
  /** O(1) row string → index; -1 if not valid. */
  getRowIndex: (row: string) => number;
  /** O(1) column string → index; -1 if not valid. */
  getColumnIndex: (column: string) => number;
}

const standardRowIndexMap = buildIndexMap(standardBoardRowLetters);
const standardColumnIndexMap = buildIndexMap(standardBoardColumnNumbers);
const smallRowIndexMap = buildIndexMap(smallBoardRowLetters);
const smallColumnIndexMap = buildIndexMap(smallBoardColumnNumbers);
const largeRowIndexMap = buildIndexMap(largeBoardRowLetters);
const largeColumnIndexMap = buildIndexMap(largeBoardColumnNumbers);

export const standardCoordinateLayout: CoordinateLayout<StandardBoardCoordinate> = {
  rowLetters: standardBoardRowLetters,
  columnNumbers: standardBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}` as StandardBoardCoordinate,
  getRowIndex: (row) => standardRowIndexMap.get(row) ?? -1,
  getColumnIndex: (col) => standardColumnIndexMap.get(col) ?? -1,
} as const;

export const smallCoordinateLayout: CoordinateLayout<SmallBoardCoordinate> = {
  rowLetters: smallBoardRowLetters,
  columnNumbers: smallBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}` as SmallBoardCoordinate,
  getRowIndex: (row) => smallRowIndexMap.get(row) ?? -1,
  getColumnIndex: (col) => smallColumnIndexMap.get(col) ?? -1,
} as const;

export const largeCoordinateLayout: CoordinateLayout<LargeBoardCoordinate> = {
  rowLetters: largeBoardRowLetters,
  columnNumbers: largeBoardColumnNumbers,
  createCoordinate: (row, column) => `${row}-${column}` as LargeBoardCoordinate,
  getRowIndex: (row) => largeRowIndexMap.get(row) ?? -1,
  getColumnIndex: (col) => largeColumnIndexMap.get(col) ?? -1,
} as const;

/**
 * Schema for coordinate layout map. Functions use z.any() so that z.infer matches
 * CoordinateLayoutMap (AssertExact); Zod cannot express board-specific coordinate literal return types.
 */
const _coordinateLayoutMapSchemaObject = z.object({
  standard: z.object({
    rowLetters: z.array(z.string()).readonly(),
    columnNumbers: z.array(z.string()).readonly(),
    createCoordinate: z.any(),
    getRowIndex: z.any(),
    getColumnIndex: z.any(),
  }),
  small: z.object({
    rowLetters: z.array(z.string()).readonly(),
    columnNumbers: z.array(z.string()).readonly(),
    createCoordinate: z.any(),
    getRowIndex: z.any(),
    getColumnIndex: z.any(),
  }),
  large: z.object({
    rowLetters: z.array(z.string()).readonly(),
    columnNumbers: z.array(z.string()).readonly(),
    createCoordinate: z.any(),
    getRowIndex: z.any(),
    getColumnIndex: z.any(),
  }),
});

type CoordinateLayoutMapSchemaType = z.infer<typeof _coordinateLayoutMapSchemaObject>;
export const coordinateLayoutMapSchema: z.ZodType<CoordinateLayoutMap> =
  _coordinateLayoutMapSchemaObject;

export interface CoordinateLayoutMap {
  standard: CoordinateLayout<StandardBoardCoordinate>;
  small: CoordinateLayout<SmallBoardCoordinate>;
  large: CoordinateLayout<LargeBoardCoordinate>;
}

/**
 * Type-safe map from board type to coordinate layout.
 */
export const coordinateLayoutMap: CoordinateLayoutMap = {
  standard: standardCoordinateLayout,
  small: smallCoordinateLayout,
  large: largeCoordinateLayout,
} as const;

const _assertExactCoordinateLayoutMap = true satisfies AssertExact<
  CoordinateLayoutMap,
  CoordinateLayoutMapSchemaType
>;

/**
 * Gets the coordinate layout for a given board type with proper type narrowing.
 * This eliminates the need for type assertions when working with generic board types.
 */
export function getCoordinateLayout<TBoard extends Board>(
  board: TBoard,
): CoordinateLayout<BoardCoordinate<TBoard>> {
  const layout = coordinateLayoutMap[board.boardType];
  if (!layout) {
    throw new Error(`Invalid board type: ${board.boardType}.`);
  }
  return layout as CoordinateLayout<BoardCoordinate<TBoard>>;
}
