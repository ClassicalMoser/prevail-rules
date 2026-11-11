import type { UnitFacing } from '@entities';
import { diagonalFacings } from '@entities';

/**
 * Whether a facing is toward a corner rather than a side.
 *
 * @param facing - The facing to check
 * @returns True if the facing is a diagonal facing
 */
export function isDiagonalFacing(facing: UnitFacing): boolean {
  const isDiagonal = diagonalFacings.some((candidate) => candidate === facing);
  return isDiagonal;
}
