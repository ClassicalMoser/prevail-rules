import type { UnitWithPlacement } from '@entities';
import { isSameUnitInstance } from '../unit/unitEquivalence';
import { isSamePlacement } from './isSamePlacement';

/**
 * Whether two units-with-placements are the same unit standing the same
 * way on the same space. A choice names the unit it acts with by where it
 * stands as well as who it is, and a validator matches that against the
 * units the rules offer: the same unit placed differently is a stale or
 * forged choice, not the offered one.
 *
 * @param a - One unit and where it stands
 * @param b - The other unit and where it stands
 * @returns True when both the unit and its placement match
 *
 * TODO(composition): nothing in production calls this. `isAtPlacement` asks
 * the same question by hand (the friendly unit on the named space, its facing,
 * then `isSameUnitInstance`), and `getLegalUnitMoves` asks it again inline
 * before a move. They differ from this in wording a refusal for each half and
 * in throwing. Settled by having both compare through this.
 */
export function isSameUnitWithPlacement(
  a: UnitWithPlacement,
  b: UnitWithPlacement,
): boolean {
  // Who it is (side, type and instance number), and where it stands and
  // which way it faces.
  const same =
    isSameUnitInstance(a.unit, b.unit) &&
    isSamePlacement(a.placement, b.placement);

  // True only when who it is and where it stands both match.
  return same;
}
