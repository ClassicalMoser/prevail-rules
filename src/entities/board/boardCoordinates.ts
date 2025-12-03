import type {
  Board,
  LargeBoard,
  LargeBoardCoordinate,
  SmallBoard,
  SmallBoardCoordinate,
  StandardBoard,
  StandardBoardCoordinate,
} from "@entities/board";
import {
  largeBoardCoordinates,
  smallBoardCoordinates,
  standardBoardCoordinates,
} from "@entities/board";
import { z } from "zod";

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
 * Helper type to extract the coordinate type from a board type
 */
export type BoardCoordinate<T extends Board> = T extends StandardBoard
  ? StandardBoardCoordinate
  : T extends SmallBoard
    ? SmallBoardCoordinate
    : T extends LargeBoard
      ? LargeBoardCoordinate
      : never;
