import type { NoneUnitPresence } from "@entities/unitPresence/noneUnitPresence.js";
import type { UnitPresence } from "@entities/unitPresence/unitPresence.js";

/**
 * Type guard to check if a unit presence has no unit.
 *
 * @param unitPresence - The unit presence to check
 * @returns True if the unit presence has no unit, false otherwise
 */
export function hasNoUnit(
  unitPresence: UnitPresence,
): unitPresence is NoneUnitPresence {
  return unitPresence.presenceType === "none";
}
