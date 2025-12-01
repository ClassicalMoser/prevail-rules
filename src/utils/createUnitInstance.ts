import type { PlayerSide } from "src/entities/player/playerSide.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";
import type { UnitType } from "src/entities/unit/unitType.js";

/** Basic utility function to create a unit instance with a specific stat value.
 * This helps to write tests that consider unit values without making
 * them too brittle.
 */
export function createUnitInstance(
  playerSide: PlayerSide,
  unitType: UnitType,
  instanceNumber: number,
): UnitInstance {
  return { playerSide, unitType, instanceNumber };
}
