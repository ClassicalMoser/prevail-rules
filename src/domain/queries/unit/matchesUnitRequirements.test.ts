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
      const { result } = matchesUnitRequirements(firstUnit, [], []);
      expect(result).toBe(true);
    });
  });

  describe('traits only', () => {
    it('returns true when unit has all required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation'],
        [],
      );
      expect(result).toBe(true);
    });

    it('returns true when unit has all multiple required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormationAndPhalanx,
        ['formation', 'phalanx'],
        [],
      );
      expect(result).toBe(true);
    });

    it('returns true when unit has all traits in different order', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormationAndPhalanx,
        ['phalanx', 'formation'],
        [],
      );
      expect(result).toBe(true);
    });

    it('returns false when unit is missing one trait', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation', 'pike'],
        [],
      );
      expect(result).toBe(false);
    });

    it('returns false when unit has none of the required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['skirmisher'],
        [],
      );
      expect(result).toBe(false);
    });

    it('returns false when unit has some but not all required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithPhalanxTrait,
        ['formation', 'javelin'],
        [],
      );
      expect(result).toBe(false);
    });
  });

  describe('unitTypes only', () => {
    it('returns true when unit is in the unitTypes array', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        [],
        [unitWithFormation.id],
      );
      expect(result).toBe(true);
    });

    it('returns true when unit is in a larger unitTypes array', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        [],
        [unitWithFormation.id, unitWithPhalanxTrait.id],
      );
      expect(result).toBe(true);
    });

    it('returns false when unit is not in the unitTypes array', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        [],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBe(false);
    });

    it('returns true when unit matches by id (different object reference)', () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithFormation,
      };
      const { result } = matchesUnitRequirements(
        sameUnitTypeDifferentRef,
        [],
        [unitWithFormation.id],
      );
      expect(result).toBe(true);
    });

    it('returns true when both the trait list and the type-id list are empty', () => {
      // This case is handled by the "no requirements" case, but testing edge case
      const { result } = matchesUnitRequirements(unitWithFormation, [], []);
      expect(result).toBe(true);
    });
  });

  describe('both traits and unitTypes', () => {
    it('returns true when unit matches both traits and unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation'],
        [unitWithFormation.id],
      );
      expect(result).toBe(true);
    });

    it('returns true when unit matches all multiple traits and unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormationAndPhalanx,
        ['formation', 'phalanx'],
        [unitWithFormationAndPhalanx.id, unitWithPhalanxTrait.id],
      );
      expect(result).toBe(true);
    });

    it('returns false when unit matches traits but not unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation'],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBe(false);
    });

    it('returns false when unit matches unitTypes but not traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['pike'],
        [unitWithFormation.id],
      );
      expect(result).toBe(false);
    });

    it('returns false when unit matches neither traits nor unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['pike'],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBe(false);
    });

    it('returns false when unit has some but not all required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithPhalanxTrait,
        ['formation', 'javelin'],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBe(false);
    });

    it('returns true when unit matches both by id (different object reference)', () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithFormation,
      };
      const { result } = matchesUnitRequirements(
        sameUnitTypeDifferentRef,
        ['formation'],
        [unitWithFormation.id],
      );
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('returns true when the type has every trait in a two-trait list', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormationAndPhalanx,
        ['formation', 'phalanx'],
        [],
      );
      expect(result).toBe(true);
    });

    it('returns false when the type has no traits and formation is required', () => {
      // Create a unit type with no traits for testing
      const unitWithNoTraits: UnitType = {
        ...unitWithFormation,
        traits: [],
      };
      const { result } = matchesUnitRequirements(
        unitWithNoTraits,
        ['formation'],
        [],
      );
      expect(result).toBe(false);
    });

    it('returns true when the trait list is empty and the type id is listed', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        [],
        [unitWithFormation.id],
      );
      expect(result).toBe(true);
    });

    it('returns true when the type-id list is empty and the unit has the trait', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation'],
        [],
      );
      expect(result).toBe(true);
    });
  });
});
