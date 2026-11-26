import type { PlayerSide, UnitInstance, UnitStatName } from '@entities';
import { createUnitInstance } from '@factories';
import { getUnitByStatValue } from '@testing/getUnitByStatValue';

/**
 * Creates a unit instance by looking up a unit with a specific stat value in {@link tempUnits}.
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
  const unitType = getUnitByStatValue(stat, value);
  return createUnitInstance(playerSide, unitType, instanceNumber);
}
