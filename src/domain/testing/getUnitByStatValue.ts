import type { UnitStatName, UnitType } from '@entities';
import { tempUnits } from '@sampleValues';

/**
 * Finds a unit type in sample data by matching a specific stat value.
 * Use this when a test needs a real roster row; for thresholds defined only by query rules,
 * prefer an explicit {@link UnitType} in the test file instead of implying roster stats.
 *
 * @throws {Error} If no unit in {@link tempUnits} has that stat value
 */
export function getUnitByStatValue(
  stat: UnitStatName,
  value: number,
): UnitType {
  // The first stand-in with that value. Which one does not matter, since a
  // spec asking by one stat must not lean on the others.
  const unit = tempUnits.find((u) => u.stats[stat] === value);

  // No stand-in having it is the spec's mistake.
  if (!unit) {
    throw new Error(`No unit found with ${stat} value ${value}.`);
  }

  // The unit type, the catalog's own copy.
  return unit;
}
