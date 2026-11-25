import type { UnitFacing } from '@entities';
import { diagonalFacings } from '@entities';

/**
 * Whether a facing is toward a corner rather than a side.
 *
 * @param facing - The facing to check
 * @returns True if the facing is a diagonal facing
 */
export function isDiagonalFacing(facing: UnitFacing): boolean {
  // Toward a corner: a step that way cuts across a corner, which the
  // blocked-diagonal test governs (§2.4.4).
  const isDiagonal = diagonalFacings.some((candidate) => candidate === facing);

  // True for north-east, south-east, south-west and north-west.
  return isDiagonal;
}
