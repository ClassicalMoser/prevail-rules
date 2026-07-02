import type { UnitType, ValidationResult } from '@entities';
import type { Trait } from '@ruleValues';

/**
 * Determines whether a unit type matches the specified requirements.
 *
 * @param unitType - The unit type to check
 * @param traits - Array of traits that the unit must have (all traits must be present)
 * @param unitTypeIds - Array of unit type ids that the unit must match (unit must be in the array)
 * @returns True if the unit matches all requirements, false otherwise
 *
 * NOTES:
 * - If both traits and unitTypes are empty arrays, returns true (no requirements)
 * - If only traits are specified, checks that the unit has at least one of the specified traits
 * - If only unitTypes are specified, checks that the unit is in the specified array
 * - If both are specified, both conditions must be satisfied
 */
export function matchesUnitRequirements(
  unitType: UnitType,
  traits: Trait[],
  unitTypeIds: string[],
): ValidationResult {
  if (traits.length === 0 && unitTypeIds.length === 0) {
    return {
      result: true,
    };
  }
  if (traits.length > 0 && unitTypeIds.length === 0) {
    const hasAllTraits = traits.every((trait) =>
      unitType.traits.includes(trait),
    );
    if (!hasAllTraits) {
      return {
        errorReason: 'Unit type does not have all required traits',
        result: false,
      };
    }
    return {
      result: true,
    };
  }
  if (traits.length === 0 && unitTypeIds.length > 0) {
    // Compare by id since UnitType is identified by its unique id field
    const isInUnitTypeIds = unitTypeIds.includes(unitType.id);
    if (!isInUnitTypeIds) {
      return {
        errorReason: 'Unit type is not in the specified types',
        result: false,
      };
    }
    return {
      result: true,
    };
  }
  const hasAllTraits = traits.every((trait) => unitType.traits.includes(trait));
  if (!hasAllTraits) {
    return {
      errorReason: 'Unit type does not have all required traits',
      result: false,
    };
  }
  const isInUnitTypeIds = unitTypeIds.includes(unitType.id);
  if (!isInUnitTypeIds) {
    return {
      errorReason: 'Unit type is not in the specified types',
      result: false,
    };
  }
  return {
    result: true,
  };
}
