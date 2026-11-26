import type { PlayerSide, UnitInstance, UnitStatName } from '@entities';
import { createUnitInstance } from '@factories';
import { getUnitByStatValue } from '@testing/getUnitByStatValue';

/**
 * Creates a unit instance by looking up a unit with a specific stat value in `tempUnits`.
 *
 * @param playerSide - The player side of the unit
 * @param stat - The stat name to search by
 * @param value - The stat value to match
 * @param instanceNumber - Unit instance number (defaults to 1)
 * @returns A unit instance with the specified stat value
 */
export function createUnitByStat(
  playerSide: PlayerSide,
  stat: UnitStatName,
  value: number,
  instanceNumber: number = 1,
): UnitInstance {
  // The first stand-in type with that value; the catalog is fungible, so a
  // spec that asks by one stat must not lean on any other.
  const unitType = getUnitByStatValue(stat, value);
  const unit = createUnitInstance(playerSide, unitType, instanceNumber);

  // A unit of that type for the side, numbered as asked.
  return unit;
}
