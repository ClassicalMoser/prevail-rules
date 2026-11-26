import type { SingleUnitPresence, UnitFacing, UnitInstance } from '@entities';

/**
 * What a space holds when one unit stands alone on it: a unit set down on
 * open ground, or the one left standing when its enemy leaves the fight.
 *
 * @param unit - The unit on the space
 * @param facing - The way it faces
 * @returns A lone unit's presence
 */
export function createSingleUnitPresence(
  unit: UnitInstance,
  facing: UnitFacing,
): SingleUnitPresence {
  // One unit alone on the space, facing one of the eight ways (§2.3.1).
  const single: SingleUnitPresence = {
    facing,
    presenceType: 'single',
    unit,
  };

  // The presence, for a board space.
  return single;
}
