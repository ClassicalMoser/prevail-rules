import type { EngagedUnitPresence, UnitFacing, UnitInstance } from '@entities';

/**
 * Creates an engaged unit presence for testing.
 *
 * @param primaryUnit - The primary unit in the engagement
 * @param primaryFacing - The facing direction of the primary unit
 * @param secondaryUnit - The secondary unit in the engagement (facing opposite the primary unit)
 * @returns An engaged unit presence
 *
 * TODO(composition): this builds a value from raw inputs, which is a factory's
 * job, and production builds the same presence by hand in its own writers
 * (`addUnitToBoard`, `removeUnitFromBoard`, `addEngagingUnitToBoard`,
 * `createEmptyBoard`). To settle: move the presence builders to `@factories`
 * and have those writers and this layer call them.
 */
export function createEngagedUnitPresence(
  primaryUnit: UnitInstance,
  primaryFacing: UnitFacing,
  secondaryUnit: UnitInstance,
): EngagedUnitPresence {
  // Two enemy units sharing one space while engaged (§2.2.1). Only the
  // primary's facing is kept: the secondary faces opposite it.
  const engaged: EngagedUnitPresence = {
    presenceType: 'engaged',
    primaryFacing,
    primaryUnit,
    secondaryUnit,
  };

  // The presence, for a board space.
  return engaged;
}
