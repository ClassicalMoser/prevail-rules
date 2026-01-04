import type { UnitStatName, UnitType } from '@entities';
import { tempUnits } from '@sampleValues';

/**
 * Finds a unit type by matching a specific stat value.
 *
 * @param stat - The stat name to search by
 * @param value - The stat value to match
 * @returns The matching unit type
 * @throws {Error} If no unit is found with the specified stat value
 */
export function getUnitByStatValue(
  stat: UnitStatName,
  value: number,
): UnitType {
  const unit = tempUnits.find((unit) => unit.stats[stat] === value);
  if (!unit) {
    throw new Error(`No unit found with ${stat} value ${value}.`);
  }
  return unit;
}
