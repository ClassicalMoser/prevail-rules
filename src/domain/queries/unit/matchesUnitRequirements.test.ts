import type { UnitType } from '@entities';
import { getUnitByStatValue, getUnitByTrait } from '@testing';

import { matchesUnitRequirements } from './matchesUnitRequirements';

/**
 * MatchesUnitRequirements: Determines whether a unit type matches the specified requirements.
 */
describe('matchesUnitRequirements function', () => {
  // Find units by their unique traits rather than by name
  // This makes tests more resilient to changes in sample data
  // GetUnitByTrait throws if not found, ensuring test failures are clear
  /** First roster unit with `formation` (Manipular Legion). */
  const unitWithFormation = getUnitByTrait('formation');
  /** E.g. African Citizen Spearmen — `formation` + `phalanx`. */
  const unitWithFormationAndPhalanx = getUnitByTrait('formation', 'phalanx');
  const unitWithPhalanxTrait = getUnitByTrait('phalanx');
  // Use stat-based lookup for first unit (attack 3 is common)
  const firstUnit = getUnitByStatValue('attack', 3);

  describe('no requirements', () => {
    it('returns true when both traits and unitTypes are empty', () => {
      expect(matchesUnitRequirements(firstUnit, [], [])).toBe(true);
    });
  });

  describe('traits only', () => {
    it('returns true when unit has all required traits', () => {
      expect(
        matchesUnitRequirements(unitWithFormation, ['formation'], []),
      ).toBe(true);
    });

    it('returns true when unit has all multiple required traits', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormationAndPhalanx,
          ['formation', 'phalanx'],
          [],
        ),
      ).toBe(true);
    });

    it('returns true when unit has all traits in different order', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormationAndPhalanx,
          ['phalanx', 'formation'],
          [],
        ),
      ).toBe(true);
    });

    it('returns false when unit is missing one trait', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormation,
          ['formation', 'missile'],
          [],
        ),
      ).toBe(false);
    });

    it('returns false when unit has none of the required traits', () => {
      expect(
        matchesUnitRequirements(unitWithFormation, ['skirmisher'], []),
      ).toBe(false);
    });

    it('returns false when unit has some but not all required traits', () => {
      expect(
        matchesUnitRequirements(
          unitWithPhalanxTrait,
          ['formation', 'javelin'],
          [],
        ),
      ).toBe(false);
    });
  });

  describe('unitTypes only', () => {
    it('returns true when unit is in the unitTypes array', () => {
      expect(
        matchesUnitRequirements(unitWithFormation, [], [unitWithFormation.id]),
      ).toBe(true);
    });

    it('returns true when unit is in a larger unitTypes array', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormation,
          [],
          [unitWithFormation.id, unitWithPhalanxTrait.id],
        ),
      ).toBe(true);
    });

    it('returns false when unit is not in the unitTypes array', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormation,
          [],
          [unitWithPhalanxTrait.id],
        ),
      ).toBe(false);
    });

    it('returns true when unit matches by id (different object reference)', () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithFormation,
      };
      expect(
        matchesUnitRequirements(
          sameUnitTypeDifferentRef,
          [],
          [unitWithFormation.id],
        ),
      ).toBe(true);
    });

    it('returns true when both the trait list and the type-id list are empty', () => {
      // This case is handled by the "no requirements" case, but testing edge case
      expect(matchesUnitRequirements(unitWithFormation, [], [])).toBe(true);
    });
  });

  describe('both traits and unitTypes', () => {
    it('returns true when unit matches both traits and unitTypes', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormation,
          ['formation'],
          [unitWithFormation.id],
        ),
      ).toBe(true);
    });

    it('returns true when unit matches all multiple traits and unitTypes', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormationAndPhalanx,
          ['formation', 'phalanx'],
          [unitWithFormationAndPhalanx.id, unitWithPhalanxTrait.id],
        ),
      ).toBe(true);
    });

    it('returns false when unit matches traits but not unitTypes', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormation,
          ['formation'],
          [unitWithPhalanxTrait.id],
        ),
      ).toBe(false);
    });

    it('returns false when unit matches unitTypes but not traits', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormation,
          ['javelin'],
          [unitWithFormation.id],
        ),
      ).toBe(false);
    });

    it('returns false when unit matches neither traits nor unitTypes', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormation,
          ['phalanx'],
          [unitWithPhalanxTrait.id],
        ),
      ).toBe(false);
    });

    it('returns false when unit has some but not all required traits', () => {
      expect(
        matchesUnitRequirements(
          unitWithPhalanxTrait,
          ['formation', 'javelin'],
          [unitWithPhalanxTrait.id],
        ),
      ).toBe(false);
    });

    it('returns true when unit matches both by id (different object reference)', () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithFormation,
      };
      expect(
        matchesUnitRequirements(
          sameUnitTypeDifferentRef,
          ['formation'],
          [unitWithFormation.id],
        ),
      ).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('returns true when the type has every trait in a two-trait list', () => {
      expect(
        matchesUnitRequirements(
          unitWithFormationAndPhalanx,
          ['formation', 'phalanx'],
          [],
        ),
      ).toBe(true);
    });

    it('returns false when the type has no traits and formation is required', () => {
      // Create a unit type with no traits for testing
      const unitWithNoTraits: UnitType = {
        ...unitWithFormation,
        traits: [],
      };
      expect(matchesUnitRequirements(unitWithNoTraits, ['formation'], [])).toBe(
        false,
      );
    });

    it('returns true when the trait list is empty and the type id is listed', () => {
      expect(
        matchesUnitRequirements(unitWithFormation, [], [unitWithFormation.id]),
      ).toBe(true);
    });

    it('returns true when the type-id list is empty and the unit has the trait', () => {
      expect(
        matchesUnitRequirements(unitWithFormation, ['formation'], []),
      ).toBe(true);
    });
  });
});
