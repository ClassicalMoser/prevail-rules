import { diagonalFacings } from "src/entities/unit/unitFacing.js";
/**
 * Check if a facing is a diagonal facing.
 * @param facing - The facing to check
 * @returns True if the facing is a diagonal facing, false otherwise
 */
export function isDiagonalFacing(facing) {
    return diagonalFacings.includes(facing);
}
