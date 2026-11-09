import type { UnitPlacement } from '@entities';

/**
 * Whether two placements are the same: the same space, facing the same way.
 * Facing is half of where a unit stands in this game (§2.3) — a unit on the
 * right space looking the wrong way is somewhere else entirely — so a
 * placement only matches when both halves do.
 *
 * Compared by value: the legal options a validator checks a choice against
 * are freshly built objects, never the ones the choice carries.
 *
 * @param a - One placement
 * @param b - The other placement
 * @returns Whether both name the same space and the same facing
 */
export function isSamePlacement(a: UnitPlacement, b: UnitPlacement): boolean {
  const isSame = a.coordinate === b.coordinate && a.facing === b.facing;
  return isSame;
}
