import type { UnitType } from '@entities';
import type { Trait } from '@sampleValues';

/**
 * Determines whether a unit type matches the specified requirements.
 *
 * @param unitType - The unit type to check
 * @param traits - Array of traits that the unit must have (all traits must be present)
 * @param unitTypes - Array of unit types that the unit must match (unit must be in the array)
 * @returns True if the unit matches all requirements, false otherwise
 *
 * @remarks
 * - If both traits and unitTypes are empty arrays, returns true (no requirements)
 * - If only traits are specified, checks that the unit has all specified traits
 * - If only unitTypes are specified, checks that the unit is in the specified array
 * - If both are specified, both conditions must be satisfied
 */
export function matchesUnitRequirements(
  unitType: UnitType,
  traits: Trait[],
  unitTypes: UnitType[],
): boolean {
  if (!traits.length && !unitTypes.length) {
    return true;
  }
  if (traits.length && !unitTypes.length) {
    return traits.every((trait) => unitType.traits.includes(trait));
  }
  if (!traits.length && unitTypes.length) {
    // Compare by id since UnitType is identified by its unique id field
    return unitTypes.some((ut) => ut.id === unitType.id);
  }
  return (
    traits.every((trait) => unitType.traits.includes(trait)) &&
    // Compare by id since UnitType is identified by its unique id field
    unitTypes.some((ut) => ut.id === unitType.id)
  );
}
