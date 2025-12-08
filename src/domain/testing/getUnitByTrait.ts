import type { UnitType } from '@entities';
import type { Trait } from '@ruleValues';
import { tempUnits } from '@sampleValues';

/**
 * Finds a unit type by matching one or more traits.
 *
 * @param traits - The trait(s) to search for. If multiple traits are provided, the unit must have all of them.
 * @returns The matching unit type
 * @throws {Error} If no unit is found with the specified trait(s)
 */
export function getUnitByTrait(...traits: Trait[]): UnitType {
  const unit = tempUnits.find((unit) =>
    traits.every((trait) => unit.traits.includes(trait)),
  );
  if (!unit) {
    const traitsStr =
      traits.length === 1
        ? `trait "${traits[0]}"`
        : `traits [${traits.map((t) => `"${t}"`).join(', ')}]`;
    throw new Error(`No unit found with ${traitsStr}.`);
  }
  return unit;
}
