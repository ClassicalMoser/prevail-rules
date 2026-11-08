import type { PlayerSide, UnitInstance, UnitType } from '@entities';

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
  // A unit has no id of its own. It is the side that fields it, its type and
  // its number among that side's units of the type, and that triple is how
  // `isSameUnitInstance` recognizes it again after it has moved.
  const unit = { instanceNumber, playerSide, unitType };
  return unit;
}
