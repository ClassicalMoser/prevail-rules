import type { UnitInstance } from "@entities/unit/unitInstance.js";

/**
 * Checks if two units belong to the same player side.
 *
 * @param unit1 - The first unit
 * @param unit2 - The second unit
 * @returns True if both units belong to the same player side, false otherwise
 */
export function areSameSide(unit1: UnitInstance, unit2: UnitInstance): boolean {
  return unit1.playerSide === unit2.playerSide;
}
