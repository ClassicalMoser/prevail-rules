import type { UnitType } from '@entities';
import type { Trait } from '@ruleValues';

/**
 * Whether a unit type meets a command's requirements (§4.3.4): every listed
 * trait, and, where unit types are listed, one of them. With neither list
 * there is nothing to fail.
 *
 * @param unitType - The unit type to judge
 * @param traits - Traits it must all have
 * @param unitTypeIds - Unit types it must be one of
 * @returns True when the unit type meets the requirements
 */
export function matchesUnitRequirements(
  unitType: UnitType,
  traits: Trait[],
  unitTypeIds: string[],
): boolean {
  // Every listed trait has to be on the type.
  const hasAllTraits = traits.every((trait) => unitType.traits.includes(trait));
  // Where types are listed, the id (not the object) must be one of them.
  const isListedType =
    unitTypeIds.length === 0 || unitTypeIds.includes(unitType.id);
  const meets = hasAllTraits && isListedType;
  return meets;
}
