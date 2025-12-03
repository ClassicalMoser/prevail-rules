import type { UnitFacing } from "@entities/unit/unitFacing.js";
import { diagonalFacings } from "@entities/unit/unitFacing.js";

/**
 * Check if a facing is a diagonal facing.
 * @param facing - The facing to check
 * @returns True if the facing is a diagonal facing, false otherwise
 */
export function isDiagonalFacing(facing: UnitFacing): boolean {
  return (diagonalFacings as readonly string[]).includes(facing);
}
