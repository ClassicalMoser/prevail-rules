import type { EngagedUnitPresence, UnitFacing, UnitInstance } from '@entities';

/**
 * What a space holds when two enemy units are engaged in it (§2.2.1). The
 * pair keeps one facing: the secondary unit faces opposite the primary.
 *
 * @param primaryUnit - The unit whose facing the pair keeps
 * @param primaryFacing - The way it faces
 * @param secondaryUnit - Its enemy, facing it
 * @returns An engaged pair's presence
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
