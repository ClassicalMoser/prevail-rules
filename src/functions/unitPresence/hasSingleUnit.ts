import type { SingleUnitPresence } from "src/entities/unitPresence/singleUnitPresence.js";
import type { UnitPresence } from "src/entities/unitPresence/unitPresence.js";

/**
 * Type guard to check if a unit presence has a single unit.
 *
 * @param unitPresence - The unit presence to check
 * @returns True if the unit presence has a single unit, false otherwise
 */
export function hasSingleUnit(
  unitPresence: UnitPresence
): unitPresence is SingleUnitPresence {
  return unitPresence.presenceType === "single";
}
