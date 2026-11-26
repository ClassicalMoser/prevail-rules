import type { EngagedUnitPresence, UnitFacing, UnitInstance } from '@entities';

/**
 * Creates an engaged unit presence for testing.
 *
 * @param primaryUnit - The primary unit in the engagement
 * @param primaryFacing - The facing direction of the primary unit
 * @param secondaryUnit - The secondary unit in the engagement (facing opposite the primary unit)
 * @returns An engaged unit presence
 */
export function createEngagedUnitPresence(
  primaryUnit: UnitInstance,
  primaryFacing: UnitFacing,
  secondaryUnit: UnitInstance,
): EngagedUnitPresence {
  const engaged: EngagedUnitPresence = {
    presenceType: 'engaged',
    primaryFacing,
    primaryUnit,
    secondaryUnit,
  };
  return engaged;
}
