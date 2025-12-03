import type { PlayerSide } from "@entities/player/playerSide.js";
import type { UnitInstance } from "@entities/unit/unitInstance.js";
import type { UnitType } from "@entities/unit/unitType.js";

/**
 * Creates a unit instance with the specified properties.
 *
 * @param playerSide - Which player owns this unit
 * @param unitType - The type of unit (defines stats, abilities, etc.)
 * @param instanceNumber - A unique number to distinguish this unit from others of the same type
 * @returns A unit instance ready to be placed on the board
 */
export function createUnitInstance(
  playerSide: PlayerSide,
  unitType: UnitType,
  instanceNumber: number,
): UnitInstance {
  return { playerSide, unitType, instanceNumber };
}
