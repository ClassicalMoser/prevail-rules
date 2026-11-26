import type { SingleUnitPresence, UnitFacing, UnitInstance } from '@entities';

/**
 * Creates a single unit presence for testing.
 *
 * @param unit - The unit in the space
 * @param facing - The facing direction of the unit
 * @returns A single unit presence
 */
export function createSingleUnitPresence(
  unit: UnitInstance,
  facing: UnitFacing,
): SingleUnitPresence {
  const single: SingleUnitPresence = {
    facing,
    presenceType: 'single',
    unit,
  };
  return single;
}
