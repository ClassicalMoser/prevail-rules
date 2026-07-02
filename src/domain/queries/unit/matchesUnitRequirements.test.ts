import type { UnitType } from '@entities';
import { getUnitByStatValue, getUnitByTrait } from '@testing';

import { matchesUnitRequirements } from './matchesUnitRequirements';

/**
 * MatchesUnitRequirements: Determines whether a unit type matches the specified requirements.
 */
describe(matchesUnitRequirements, () => {
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
    it('given both traits and unitTypes are empty, returns true', () => {
      const { result } = matchesUnitRequirements(firstUnit, [], []);
      expect(result).toBeTruthy();
    });
  });

  describe('traits only', () => {
    it('given unit has all required traits, returns true', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation'],
        [],
      );
      expect(result).toBeTruthy();
    });

    it('given unit has all multiple required traits, returns true', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormationAndPhalanx,
        ['formation', 'phalanx'],
        [],
      );
      expect(result).toBeTruthy();
    });

    it('given unit has all traits in different order, returns true', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormationAndPhalanx,
        ['phalanx', 'formation'],
        [],
      );
      expect(result).toBeTruthy();
    });

    it('given unit is missing one trait, returns false', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation', 'spear'],
        [],
      );
      expect(result).toBeFalsy();
    });

    it('given unit has none of the required traits, returns false', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['skirmish'],
        [],
      );
      expect(result).toBeFalsy();
    });

    it('given unit has some but not all required traits, returns false', () => {
      const { result } = matchesUnitRequirements(
        unitWithPhalanxTrait,
        ['formation', 'javelin'],
        [],
      );
      expect(result).toBeFalsy();
    });
  });

  describe('unitTypes only', () => {
    it('given unit is in the unitTypes array, returns true', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        [],
        [unitWithFormation.id],
      );
      expect(result).toBeTruthy();
    });

    it('given unit is in a larger unitTypes array, returns true', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        [],
        [unitWithFormation.id, unitWithPhalanxTrait.id],
      );
      expect(result).toBeTruthy();
    });

    it('given unit is not in the unitTypes array, returns false', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        [],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBeFalsy();
    });

    it('given unit matches by id (different object reference), returns true', () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithFormation,
      };
      const { result } = matchesUnitRequirements(
        sameUnitTypeDifferentRef,
        [],
        [unitWithFormation.id],
      );
      expect(result).toBeTruthy();
    });

    it('given unitTypes array is empty but unit is not specified, returns false', () => {
      // This case is handled by the "no requirements" case, but testing edge case
      const { result } = matchesUnitRequirements(unitWithFormation, [], []);
      expect(result).toBeTruthy();
    });
  });

  describe('both traits and unitTypes', () => {
    it('given unit matches both traits and unitTypes, returns true', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation'],
        [unitWithFormation.id],
      );
      expect(result).toBeTruthy();
    });

    it('given unit matches all multiple traits and unitTypes, returns true', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormationAndPhalanx,
        ['formation', 'phalanx'],
        [unitWithFormationAndPhalanx.id, unitWithPhalanxTrait.id],
      );
      expect(result).toBeTruthy();
    });

    it('given unit matches traits but not unitTypes, returns false', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation'],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBeFalsy();
    });

    it('given unit matches unitTypes but not traits, returns false', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['spear'],
        [unitWithFormation.id],
      );
      expect(result).toBeFalsy();
    });

    it('given unit matches neither traits nor unitTypes, returns false', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['spear'],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBeFalsy();
    });

    it('given unit has some but not all required traits, returns false', () => {
      const { result } = matchesUnitRequirements(
        unitWithPhalanxTrait,
        ['formation', 'javelin'],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBeFalsy();
    });

    it('given unit matches both by id (different object reference), returns true', () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithFormation,
      };
      const { result } = matchesUnitRequirements(
        sameUnitTypeDifferentRef,
        ['formation'],
        [unitWithFormation.id],
      );
      expect(result).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('given handle units with many traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithPhalanxTrait,
        ['formation', 'phalanx'],
        [],
      );
      expect(result).toBeTruthy();
    });

    it('given handle units with no traits', () => {
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
      expect(result).toBeFalsy();
    });

    it('given handle empty traits array with unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        [],
        [unitWithFormation.id],
      );
      expect(result).toBeTruthy();
    });

    it('given handle empty unitTypes array with traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormation,
        ['formation'],
        [],
      );
      expect(result).toBeTruthy();
    });
  });
});
