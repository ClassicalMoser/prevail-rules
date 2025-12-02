import type { PlayerSide } from "src/entities/player/playerSide.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";

/**
 * Checks if a unit belongs to the given player side (is friendly).
 *
 * @param unit - The unit to check
 * @param playerSide - The player side to check against
 * @returns True if the unit belongs to the player side, false otherwise
 */
export function isFriendlyUnit(
  unit: UnitInstance,
  playerSide: PlayerSide
): boolean {
  return unit.playerSide === playerSide;
}
