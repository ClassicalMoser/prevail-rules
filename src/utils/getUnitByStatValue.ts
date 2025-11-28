import type { UnitType } from "src/entities/unit/unitType.js";
import { tempUnits } from "src/sampleValues/tempUnits.js";

/** Basic utility function to get a unit by a specific stat value.
 * This helps to write tests that consider unit values without making
 * them too brittle.
 */
export function getUnitByStatValue(
  stat: keyof UnitType,
  value: number
): UnitType | undefined {
  const unit = tempUnits.find((unit) => unit[stat] === value);
  if (!unit) {
    throw new Error(`No unit found with ${stat} value ${value}.`);
  }
  return unit;
}
