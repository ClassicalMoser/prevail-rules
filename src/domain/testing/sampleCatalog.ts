import type { UnitType } from '@entities';
import {
  blackMiniStarterArmy,
  tempCommandCards,
  tempUnits,
  whiteMiniStarterArmy,
} from '@sampleValues';

/**
 * Catalog samples for fixtures. Specs import these through `@testing`, not
 * `@sampleValues`. Prefer `createTestCard` / `createTestUnit` when the test
 * does not depend on a particular catalog entry.
 *
 * The sampleValues barrel exports the unit and card arrays (and starter
 * armies), matching how fixtures walk those catalogs. Named unit rows below
 * are the few sheet entries specs still ask for by identity.
 */

export {
  blackMiniStarterArmy,
  tempCommandCards,
  tempUnits,
  whiteMiniStarterArmy,
};

/**
 * The sample unit with this display name, or throw when the catalog has none.
 */
function requireSampleUnit(name: string): UnitType {
  const unit = tempUnits.find((entry) => entry.name === name);
  if (unit === undefined) {
    throw new Error(`No sample unit named ${name}`);
  }
  return unit;
}

/** Velites from the sample roster. */
export const velites: UnitType = requireSampleUnit('Velites');

/** Manipular Legion from the sample roster. */
export const manipularLegion: UnitType = requireSampleUnit('Manipular Legion');

/** Alae Socii from the sample roster. */
export const alaeSocii: UnitType = requireSampleUnit('Alae Socii');

/** Equites from the sample roster. */
export const equites: UnitType = requireSampleUnit('Equites');

/** Punic Citizen Spearmen from the sample roster. */
export const punicCitizenSpearmen: UnitType = requireSampleUnit(
  'Punic Citizen Spearmen',
);

/** African Elephants from the sample roster. */
export const africanElephants: UnitType =
  requireSampleUnit('African Elephants');
