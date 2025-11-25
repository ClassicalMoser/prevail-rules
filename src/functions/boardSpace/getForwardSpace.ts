import type { Board, BoardCoordinate } from "../../entities/board/board.js";
import type { BoardConfig } from "../../entities/board/boardConfig.js";
import type { UnitFacing } from "../../entities/unit/unitFacing.js";
import { boardConfigMap } from "../../entities/board/boardConfig.js";
import { unitFacingSchema } from "../../entities/unit/unitFacing.js";
import { getColumnDelta, getRowDelta } from "./deltas.js";

/**
 * Internal helper that performs the coordinate calculation.
 * Can be called directly with config for efficiency when called multiple times.
 * Trusts the types - validation happens at boundaries, not here.
 */
export function getForwardSpaceWithConfig<TCoordinate extends string>(
  coordinate: TCoordinate,
  facing: UnitFacing,
  config: BoardConfig<TCoordinate>,
): TCoordinate | undefined {
  // Parse coordinate - already validated at boundary, so we trust the format
  // Coordinates are formatted as "Row-Column" (e.g., "E-5" = row E, column 5)
  const inputRow = coordinate.split("-")[0]!;
  const inputColumn = coordinate.split("-")[1]!;

  // Convert string coordinates to array indices for mathematical operations
  const currentRowIndex = config.rowLetters.indexOf(inputRow);
  const currentColumnIndex = config.columnNumbers.indexOf(inputColumn);

  // Validate row and column (defensive check for invalid coordinates that bypass TypeScript)
  if (currentRowIndex === -1) {
    throw new Error(`Invalid row: ${inputRow}`);
  }
  if (currentColumnIndex === -1) {
    throw new Error(`Invalid column: ${inputColumn}`);
  }

  // Validate facing (defensive check for invalid facings that bypass TypeScript)
  const facingResult = unitFacingSchema.safeParse(facing);
  if (!facingResult.success) {
    throw new Error(`Invalid facing: ${facing}`);
  }

  // Calculate the new position by applying the movement deltas
  const newRowIndex = currentRowIndex + getRowDelta(facing);
  const newColumnIndex = currentColumnIndex + getColumnDelta(facing);

  // Boundary check
  if (
    newRowIndex < 0 ||
    newRowIndex >= config.rowLetters.length ||
    newColumnIndex < 0 ||
    newColumnIndex >= config.columnNumbers.length
  ) {
    return undefined;
  }

  // Convert the calculated indices back to string coordinates
  const newRow = config.rowLetters[newRowIndex]!;
  const newColumn = config.columnNumbers[newColumnIndex]!;

  // Reconstruct the coordinate string
  return config.createCoordinate(newRow, newColumn);
}

/**
 * Calculates the coordinate of the space directly forward from a given coordinate
 * in the specified facing direction.
 *
 * This is a fundamental building block for movement and area calculation functions.
 * It handles:
 * - Coordinate system translation (string coordinates to indices)
 * - Movement calculation (applying deltas based on facing)
 * - Boundary checking (returns undefined for out-of-bounds spaces)
 *
 * Note: Validation happens at boundaries (when boards/coordinates are created).
 * This function trusts the types and performs no runtime validation.
 *
 * @param board - The board object (used to get config)
 * @param coordinate - The starting coordinate (e.g., "E-5")
 * @param facing - The direction the unit is facing (e.g., "north", "southEast")
 * @returns The forward space coordinate, or undefined if the space is out of bounds
 *
 * @example
 * const board: StandardBoard = ...;
 * getForwardSpace(board, "E-5", "north") // Returns "D-5"
 * getForwardSpace(board, "A-1", "north") // Returns undefined (out of bounds)
 */
export function getForwardSpace(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing,
): BoardCoordinate<Board> | undefined {
  const config = boardConfigMap[board.boardType];
  return getForwardSpaceWithConfig(coordinate, facing, config) as
    | BoardCoordinate<Board>
    | undefined;
}
