import type { UnitType } from '@entities';
import type { Trait } from '@ruleValues';
import { tempUnits } from '@sampleValues';

/**
 * Finds a unit type in sample data matching the given traits (all required).
 * Use this when a test needs a real roster row; do not assert outcomes that depend on stats
 * you have not read from that row—set up state from those stats or use an explicit {@link UnitType}.
 *
 * @throws {Error} If no unit in {@link tempUnits} has all of the traits
 */
export function getUnitByTrait(...traits: Trait[]): UnitType {
  // The first stand-in with every trait asked for, as a card's trait
  // restriction asks for every listed trait (§4.3.4).
  const unit = tempUnits.find((u) =>
    traits.every((trait) => u.traits.includes(trait)),
  );

  // No stand-in having them all is the spec's mistake; the message names
  // the traits.
  if (!unit) {
    const traitsStr =
      traits.length === 1
        ? `trait "${traits[0]}"`
        : `traits [${traits.map((t) => `"${t}"`).join(', ')}]`;
    throw new Error(`No unit found with ${traitsStr}.`);
  }

  // The unit type, the catalog's own copy.
  return unit;
}
