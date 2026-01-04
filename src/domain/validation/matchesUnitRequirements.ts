import type { UnitType } from '@entities';
import type { Trait } from '@ruleValues';

/**
 * Determines whether a unit type matches the specified requirements.
 *
 * @param unitType - The unit type to check
 * @param traits - Array of traits that the unit must have (all traits must be present)
 * @param unitTypeIds - Array of unit type ids that the unit must match (unit must be in the array)
 * @returns True if the unit matches all requirements, false otherwise
 *
 * @remarks
 * - If both traits and unitTypes are empty arrays, returns true (no requirements)
 * - If only traits are specified, checks that the unit has at least one of the specified traits
 * - If only unitTypes are specified, checks that the unit is in the specified array
 * - If both are specified, both conditions must be satisfied
 */
export function matchesUnitRequirements(
  unitType: UnitType,
  traits: Trait[],
  unitTypeIds: string[],
): boolean {
  if (!traits.length && !unitTypeIds.length) {
    return true;
  }
  if (traits.length && !unitTypeIds.length) {
    return traits.every((trait) => unitType.traits.includes(trait));
  }
  if (!traits.length && unitTypeIds.length) {
    // Compare by id since UnitType is identified by its unique id field
    return unitTypeIds.includes(unitType.id);
  }
  return (
    traits.every((trait) => unitType.traits.includes(trait)) &&
    // Compare by id since UnitType is identified by its unique id field
    unitTypeIds.includes(unitType.id)
  );
}
