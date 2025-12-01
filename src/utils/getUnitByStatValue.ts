import type { UnitType } from "src/entities/unit/unitType.js";
import { tempUnits } from "src/sampleValues/tempUnits.js";

/**
 * Finds a unit type by matching a specific stat value.
 *
 * @param stat - The stat name to search by
 * @param value - The stat value to match
 * @returns The matching unit type, or undefined if no match is found
 * @throws {Error} If no unit is found with the specified stat value
 */
export function getUnitByStatValue(
  stat: keyof UnitType,
  value: number,
): UnitType | undefined {
  const unit = tempUnits.find((unit) => unit[stat] === value);
  if (!unit) {
    throw new Error(`No unit found with ${stat} value ${value}.`);
  }
  return unit;
}
