import type { UnitType } from '@entities';
import type { ValidationResult } from '@utils';
import type { Trait } from '@ruleValues';

/**
 * Determines whether a unit type matches the specified requirements.
 *
 * @param unitType - The unit type to check
 * @param traits - Array of traits that the unit must have (all traits must be present)
 * @param unitTypeIds - Array of unit type ids that the unit must match (unit must be in the array)
 * @returns True if the unit matches all requirements, false otherwise
 *
 * Empty lists are no requirement and match.
 * A trait list matches only when the unit type has every listed trait.
 * A unit-type list matches when this type's id is in the list.
 * When both lists are present, both conditions must hold.
 */
export function matchesUnitRequirements(
  unitType: UnitType,
  traits: Trait[],
  unitTypeIds: string[],
): ValidationResult {
  // No trait list and no type list: nothing to fail.
  if (traits.length === 0 && unitTypeIds.length === 0) {
    return {
      result: true,
    };
  }
  // Traits only. Every listed trait has to be on the type.
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
  // Type ids only. Match the id, not the object.
  if (traits.length === 0 && unitTypeIds.length > 0) {
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
  // Both lists are present. Traits fail first, then the type id.
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
