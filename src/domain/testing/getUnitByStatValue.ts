import type { UnitStatName, UnitType } from '@entities';
import { tempUnits } from '@sampleValues';

/**
 * Finds a unit type in sample data by matching a specific stat value.
 * Use this when a test needs a real roster row; for thresholds defined only by query rules,
 * prefer an explicit {@link UnitType} in the test file instead of implying roster stats.
 *
 * @throws {Error} If no unit in `tempUnits` has that stat value
 */
export function getUnitByStatValue(
  stat: UnitStatName,
  value: number,
): UnitType {
  const unit = tempUnits.find((u) => u.stats[stat] === value);
  if (!unit) {
    throw new Error(`No unit found with ${stat} value ${value}.`);
  }
  return unit;
}
