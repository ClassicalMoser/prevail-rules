import type { EngagedUnitPresence } from "@entities/unitPresence/engagedUnitPresence.js";
import type { UnitPresence } from "@entities/unitPresence/unitPresence.js";

/**
 * Type guard to check if a unit presence has engaged units.
 *
 * @param unitPresence - The unit presence to check
 * @returns True if the unit presence has engaged units, false otherwise
 */
export function hasEngagedUnits(
  unitPresence: UnitPresence,
): unitPresence is EngagedUnitPresence {
  return unitPresence.presenceType === "engaged";
}
