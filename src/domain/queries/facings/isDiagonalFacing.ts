import type { UnitFacing } from '@entities';
import { diagonalFacings } from '@entities';
import type { ValidationResult } from '@utils';

/**
 * Check if a facing is a diagonal facing.
 * @param facing - The facing to check
 * @returns True if the facing is a diagonal facing, false otherwise
 */
export function isDiagonalFacing(facing: UnitFacing): ValidationResult {
  const isDiagonal = diagonalFacings.some((candidate) => candidate === facing);
  if (!isDiagonal) {
    return {
      errorReason: 'Facing is not a diagonal facing',
      result: false,
    };
  }
  return {
    result: true,
  };
}
