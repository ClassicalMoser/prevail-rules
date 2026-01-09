import type { UnitFacing, ValidationResult } from '@entities';
import { diagonalFacings } from '@entities';

/**
 * Check if a facing is a diagonal facing.
 * @param facing - The facing to check
 * @returns True if the facing is a diagonal facing, false otherwise
 */
export function isDiagonalFacing(facing: UnitFacing): ValidationResult {
  const isDiagonal = (diagonalFacings as readonly string[]).includes(facing);
  if (!isDiagonal) {
    return {
      result: false,
      errorReason: 'Facing is not a diagonal facing',
    };
  }
  return {
    result: true,
  };
}
