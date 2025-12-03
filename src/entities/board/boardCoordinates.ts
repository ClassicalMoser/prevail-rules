import type {
  Board,
  LargeBoard,
  LargeBoardCoordinate,
  SmallBoard,
  SmallBoardCoordinate,
  StandardBoard,
  StandardBoardCoordinate,
} from '@entities';
import { z } from 'zod';
import { largeBoardCoordinates } from './largeBoard';
import { smallBoardCoordinates } from './smallBoard';
import { standardBoardCoordinates } from './standardBoard';

/**
 * All valid coordinates across all board types, deduplicated.
 *
 * Combines coordinates from standard, small, and large boards, removing duplicates.
 * Coordinates like "A-1" may exist in multiple board types, so we deduplicate.
 * The `satisfies` clause ensures the array contains only valid coordinate types
 * while preserving literal types for proper enum inference.
 */
const allBoardCoordinates = [
  ...new Set([
    ...standardBoardCoordinates,
    ...smallBoardCoordinates,
    ...largeBoardCoordinates,
  ]),
] as const satisfies readonly (
  | StandardBoardCoordinate
  | SmallBoardCoordinate
  | LargeBoardCoordinate
)[];

/**
 * The schema for a board coordinate.
 *
 * PERMISSIVE SCHEMA:
 * This schema is permissive in that it allows any string that matches the pattern of a board coordinate.
 * This is useful because it allows for any coordinate from any board type to be used in a command.
 *
 * Commands must still be validated against the specific board type schema, and for rule compliance.
 *
 */
export const boardCoordinateSchema = z.enum(
  allBoardCoordinates as [
    StandardBoardCoordinate | SmallBoardCoordinate | LargeBoardCoordinate,
    ...(
      | StandardBoardCoordinate
      | SmallBoardCoordinate
      | LargeBoardCoordinate
    )[],
  ],
);

/**
 * Helper type to extract the coordinate type from a board type.
 *
 * This generic type ensures type safety by matching board types to their
 * corresponding coordinate types. This prevents using the wrong coordinate
 * type with a board.
 *
 * @example
 * ```typescript
 * // ✅ Type-safe: coordinate matches board type
 * const standardBoard: StandardBoard = createEmptyStandardBoard();
 * const coord: BoardCoordinate<StandardBoard> = "E-5"; // StandardBoardCoordinate
 * const space = getBoardSpace(standardBoard, coord);
 *
 * // ❌ Type error: coordinate doesn't match board type
 * const smallCoord: SmallBoardCoordinate = "A-1";
 * const space = getBoardSpace(standardBoard, smallCoord); // Error!
 * ```
 *
 * @example
 * ```typescript
 * // Generic functions use this to ensure type safety
 * function getSpace<TBoard extends Board>(
 *   board: TBoard,
 *   coordinate: BoardCoordinate<TBoard>
 * ): BoardSpace {
 *   // TypeScript ensures coordinate matches board type
 * }
 * ```
 */
export type BoardCoordinate<T extends Board> = T extends StandardBoard
  ? StandardBoardCoordinate
  : T extends SmallBoard
    ? SmallBoardCoordinate
    : T extends LargeBoard
      ? LargeBoardCoordinate
      : never;
