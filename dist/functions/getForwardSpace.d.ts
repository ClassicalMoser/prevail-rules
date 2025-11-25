import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "../entities/unit/unitFacing.js";
/**
 * Calculates the coordinate of the space directly forward from a given coordinate
 * in the specified facing direction.
 *
 * This is a fundamental building block for movement and area calculation functions.
 * It handles:
 * - Input validation (coordinate format, facing validity)
 * - Coordinate system translation (string coordinates to indices)
 * - Movement calculation (applying deltas based on facing)
 * - Boundary checking (returns undefined for out-of-bounds spaces)
 *
 * @param coordinate - The starting coordinate (e.g., "E5")
 * @param facing - The direction the unit is facing (e.g., "north", "southEast")
 * @returns The forward space coordinate, or undefined if the space is out of bounds
 * @throws {Error} If the coordinate format is invalid (invalid row or column)
 * @throws {Error} If the facing direction is invalid
 *
 * @example
 * getForwardSpace("E5", "north") // Returns "D5"
 * getForwardSpace("A1", "north") // Returns undefined (out of bounds)
 * getForwardSpace("E5", "southEast") // Returns "F6"
 */
export declare const getForwardSpace: (coordinate: StandardBoardCoordinate, facing: UnitFacing) => StandardBoardCoordinate | undefined;
//# sourceMappingURL=getForwardSpace.d.ts.map