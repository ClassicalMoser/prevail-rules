import type { Board, BoardCoordinate } from "../entities/board/board.js";
import type { BoardConfig } from "../entities/board/boardConfig.js";
import type { UnitFacing } from "../entities/unit/unitFacing.js";
/**
 * Internal helper that performs the coordinate calculation.
 * Can be called directly with config for efficiency when called multiple times.
 * Trusts the types - validation happens at boundaries, not here.
 */
export declare function getForwardSpaceWithConfig<TCoordinate extends string>(coordinate: TCoordinate, facing: UnitFacing, config: BoardConfig<TCoordinate>): TCoordinate | undefined;
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
export declare function getForwardSpace(board: Board, coordinate: BoardCoordinate<Board>, facing: UnitFacing): BoardCoordinate<Board> | undefined;
//# sourceMappingURL=getForwardSpace.d.ts.map