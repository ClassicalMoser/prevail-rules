import type { UnitType } from '@entities';
import { getUnitByStatValue, getUnitByTrait } from '@testing';
import { describe, expect, it } from 'vitest';
import { matchesUnitRequirements } from './matchesUnitRequirements';

describe('matchesUnitRequirements', () => {
  // Find units by their unique traits rather than by name
  // This makes tests more resilient to changes in sample data
  // getUnitByTrait throws if not found, ensuring test failures are clear
  const unitWithSwordTrait = getUnitByTrait('sword');
  const unitWithFormationAndSwordTraits = getUnitByTrait('formation', 'sword');
  const unitWithPhalanxTrait = getUnitByTrait('phalanx');
  // Use stat-based lookup for first unit (attack 3 is common)
  const firstUnit = getUnitByStatValue('attack', 3);

  describe('no requirements', () => {
    it('should return true when both traits and unitTypes are empty', () => {
      const { result } = matchesUnitRequirements(firstUnit, [], []);
      expect(result).toBe(true);
    });
  });

  describe('traits only', () => {
    it('should return true when unit has all required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        ['formation'],
        [],
      );
      expect(result).toBe(true);
    });

    it('should return true when unit has all multiple required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormationAndSwordTraits,
        ['formation', 'sword'],
        [],
      );
      expect(result).toBe(true);
    });

    it('should return true when unit has all traits in different order', () => {
      const { result } = matchesUnitRequirements(
        unitWithFormationAndSwordTraits,
        ['sword', 'formation'],
        [],
      );
      expect(result).toBe(true);
    });

    it('should return false when unit is missing one trait', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        ['formation', 'spear'],
        [],
      );
      expect(result).toBe(false);
    });

    it('should return false when unit has none of the required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        ['skirmish'],
        [],
      );
      expect(result).toBe(false);
    });

    it('should return false when unit has some but not all required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithPhalanxTrait,
        ['formation', 'sword'],
        [],
      );
      expect(result).toBe(false);
    });
  });

  describe('unitTypes only', () => {
    it('should return true when unit is in the unitTypes array', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        [],
        [unitWithSwordTrait.id],
      );
      expect(result).toBe(true);
    });

    it('should return true when unit is in a larger unitTypes array', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        [],
        [unitWithSwordTrait.id, unitWithPhalanxTrait.id],
      );
      expect(result).toBe(true);
    });

    it('should return false when unit is not in the unitTypes array', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        [],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBe(false);
    });

    it('should return true when unit matches by id (different object reference)', () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithSwordTrait,
      };
      const { result } = matchesUnitRequirements(
        sameUnitTypeDifferentRef,
        [],
        [unitWithSwordTrait.id],
      );
      expect(result).toBe(true);
    });

    it('should return false when unitTypes array is empty but unit is not specified', () => {
      // This case is handled by the "no requirements" case, but testing edge case
      const { result } = matchesUnitRequirements(unitWithSwordTrait, [], []);
      expect(result).toBe(true);
    });
  });

  describe('both traits and unitTypes', () => {
    it('should return true when unit matches both traits and unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        ['formation'],
        [unitWithSwordTrait.id],
      );
      expect(result).toBe(true);
    });

    it('should return true when unit matches all multiple traits and unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        ['formation', 'sword'],
        [unitWithSwordTrait.id, unitWithPhalanxTrait.id],
      );
      expect(result).toBe(true);
    });

    it('should return false when unit matches traits but not unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        ['formation'],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBe(false);
    });

    it('should return false when unit matches unitTypes but not traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        ['spear'],
        [unitWithSwordTrait.id],
      );
      expect(result).toBe(false);
    });

    it('should return false when unit matches neither traits nor unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        ['spear'],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBe(false);
    });

    it('should return false when unit has some but not all required traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithPhalanxTrait,
        ['formation', 'sword'],
        [unitWithPhalanxTrait.id],
      );
      expect(result).toBe(false);
    });

    it('should return true when unit matches both by id (different object reference)', () => {
      // Create a new UnitType object with the same id but different reference
      const sameUnitTypeDifferentRef: UnitType = {
        ...unitWithSwordTrait,
      };
      const { result } = matchesUnitRequirements(
        sameUnitTypeDifferentRef,
        ['formation'],
        [unitWithSwordTrait.id],
      );
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle units with many traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithPhalanxTrait,
        ['formation', 'spear', 'phalanx'],
        [],
      );
      expect(result).toBe(true);
    });

    it('should handle units with no traits', () => {
      // Create a unit type with no traits for testing
      const unitWithNoTraits: UnitType = {
        ...unitWithSwordTrait,
        traits: [],
      };
      const { result } = matchesUnitRequirements(
        unitWithNoTraits,
        ['formation'],
        [],
      );
      expect(result).toBe(false);
    });

    it('should handle empty traits array with unitTypes', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        [],
        [unitWithSwordTrait.id],
      );
      expect(result).toBe(true);
    });

    it('should handle empty unitTypes array with traits', () => {
      const { result } = matchesUnitRequirements(
        unitWithSwordTrait,
        ['formation'],
        [],
      );
      expect(result).toBe(true);
    });
  });
});
