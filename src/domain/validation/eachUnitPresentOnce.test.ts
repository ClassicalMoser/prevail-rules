import type { UnitCount, UnitType } from '@entities';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  getUnitByStatValue,
} from '@testing';
import { createUnitInstance } from '@transforms';
import { describe, expect, it } from 'vitest';
import { eachUnitPresentOnce } from './eachUnitPresentOnce';

describe('eachUnitPresentOnce', () => {
  const attack2UnitType = getUnitByStatValue('attack', 2);
  const attack3UnitType = getUnitByStatValue('attack', 3);

  if (!attack2UnitType || !attack3UnitType) {
    throw new Error('Required unit types not found');
  }

  // Helper: Creates unit instance matching the function's 1-indexed pattern
  // Function uses: for (let i = 1; i <= count; i++) createUnitInstance(..., i)
  // So for count=1: creates instance 1, for count=2: creates instances 1 and 2
  const createExpectedUnit = (
    playerSide: 'white' | 'black',
    unitType: UnitType,
    instanceNumber: number,
  ) => createUnitInstance(playerSide, unitType, instanceNumber);

  // Helper: Creates army set from unit type and count
  const createArmy = (unitType: UnitType, count: number): Set<UnitCount> =>
    new Set([{ unitType, count }]);

  describe('valid cases', () => {
    it('should return true when all units are present once on empty board with empty armies', () => {
      expect(
        eachUnitPresentOnce(new Set(), new Set(), createBoardWithUnits([])),
      ).toBe(true);
    });

    it('should return true when all white units are present once', () => {
      const unit1 = createExpectedUnit('white', attack2UnitType, 1);
      const unit2 = createExpectedUnit('white', attack2UnitType, 2);
      const whiteArmy = createArmy(attack2UnitType, 2);
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
        { unit: unit2, coordinate: 'E-6', facing: 'north' },
      ]);

      expect(eachUnitPresentOnce(whiteArmy, new Set(), board)).toBe(true);
    });

    it('should return true when all black units are present once', () => {
      const unit1 = createExpectedUnit('black', attack2UnitType, 1);
      const blackArmy = createArmy(attack2UnitType, 1);
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
      ]);

      expect(eachUnitPresentOnce(new Set(), blackArmy, board)).toBe(true);
    });

    it('should return true when both white and black units are present once', () => {
      const whiteUnit = createExpectedUnit('white', attack2UnitType, 1);
      const blackUnit = createExpectedUnit('black', attack2UnitType, 1);
      const whiteArmy = createArmy(attack2UnitType, 1);
      const blackArmy = createArmy(attack2UnitType, 1);
      const board = createBoardWithUnits([
        { unit: whiteUnit, coordinate: 'E-5', facing: 'north' },
        { unit: blackUnit, coordinate: 'E-6', facing: 'south' },
      ]);

      expect(eachUnitPresentOnce(whiteArmy, blackArmy, board)).toBe(true);
    });

    it('should return true when engaged units are present', () => {
      const whiteUnit = createExpectedUnit('white', attack2UnitType, 1);
      const blackUnit = createExpectedUnit('black', attack2UnitType, 1);
      const whiteArmy = createArmy(attack2UnitType, 1);
      const blackArmy = createArmy(attack2UnitType, 1);
      const board = createBoardWithEngagedUnits(
        whiteUnit,
        blackUnit,
        'E-5',
        'north',
      );

      expect(eachUnitPresentOnce(whiteArmy, blackArmy, board)).toBe(true);
    });

    it('should return true with multiple unit types', () => {
      const whiteUnit1 = createExpectedUnit('white', attack2UnitType, 1);
      const whiteUnit2 = createExpectedUnit('white', attack3UnitType, 1);
      const whiteArmy = new Set<UnitCount>([
        { unitType: attack2UnitType, count: 1 },
        { unitType: attack3UnitType, count: 1 },
      ]);
      const board = createBoardWithUnits([
        { unit: whiteUnit1, coordinate: 'E-5', facing: 'north' },
        { unit: whiteUnit2, coordinate: 'E-6', facing: 'north' },
      ]);

      expect(eachUnitPresentOnce(whiteArmy, new Set(), board)).toBe(true);
    });
  });

  describe('duplicate units', () => {
    it('should return false when a unit appears twice on the board', () => {
      const unit1 = createExpectedUnit('white', attack2UnitType, 1);
      const whiteArmy = createArmy(attack2UnitType, 1);
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
        { unit: unit1, coordinate: 'E-6', facing: 'north' },
      ]);

      expect(eachUnitPresentOnce(whiteArmy, new Set(), board)).toBe(false);
    });

    it('should return false when primary unit in engagement appears elsewhere', () => {
      const whiteUnit = createExpectedUnit('white', attack2UnitType, 1);
      const blackUnit = createExpectedUnit('black', attack2UnitType, 1);
      const whiteArmy = createArmy(attack2UnitType, 1);
      const blackArmy = createArmy(attack2UnitType, 1);
      const board = createBoardWithEngagedUnits(
        whiteUnit,
        blackUnit,
        'E-5',
        'north',
      );
      const space = board.board['E-6'];
      if (!space) throw new Error('Space E-6 not found');
      board.board['E-6'] = {
        ...space,
        unitPresence: {
          presenceType: 'single',
          unit: whiteUnit,
          facing: 'north',
        },
      };

      expect(eachUnitPresentOnce(whiteArmy, blackArmy, board)).toBe(false);
    });

    it('should return false when secondary unit in engagement appears elsewhere', () => {
      const whiteUnit = createExpectedUnit('white', attack2UnitType, 1);
      const blackUnit = createExpectedUnit('black', attack2UnitType, 1);
      const whiteArmy = createArmy(attack2UnitType, 1);
      const blackArmy = createArmy(attack2UnitType, 1);
      const board = createBoardWithEngagedUnits(
        whiteUnit,
        blackUnit,
        'E-5',
        'north',
      );
      const space = board.board['E-6'];
      if (!space) throw new Error('Space E-6 not found');
      board.board['E-6'] = {
        ...space,
        unitPresence: {
          presenceType: 'single',
          unit: blackUnit,
          facing: 'south',
        },
      };

      expect(eachUnitPresentOnce(whiteArmy, blackArmy, board)).toBe(false);
    });
  });

  describe('missing units', () => {
    it('should return false when a unit from army is missing from board', () => {
      const unit1 = createExpectedUnit('white', attack2UnitType, 1);
      const whiteArmy = createArmy(attack2UnitType, 2);
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
      ]);

      expect(eachUnitPresentOnce(whiteArmy, new Set(), board)).toBe(false);
    });

    it('should return false when white unit is missing', () => {
      const blackUnit = createExpectedUnit('black', attack2UnitType, 1);
      const whiteArmy = createArmy(attack2UnitType, 1);
      const blackArmy = createArmy(attack2UnitType, 1);
      const board = createBoardWithUnits([
        { unit: blackUnit, coordinate: 'E-5', facing: 'south' },
      ]);

      expect(eachUnitPresentOnce(whiteArmy, blackArmy, board)).toBe(false);
    });

    it('should return false when black unit is missing', () => {
      const whiteUnit = createExpectedUnit('white', attack2UnitType, 1);
      const whiteArmy = createArmy(attack2UnitType, 1);
      const blackArmy = createArmy(attack2UnitType, 1);
      const board = createBoardWithUnits([
        { unit: whiteUnit, coordinate: 'E-5', facing: 'north' },
      ]);

      expect(eachUnitPresentOnce(whiteArmy, blackArmy, board)).toBe(false);
    });
  });

  describe('unexpected units', () => {
    it('should return false when board has unit not in armies', () => {
      const unit1 = createExpectedUnit('white', attack2UnitType, 1);
      const unexpectedUnit = createExpectedUnit('white', attack3UnitType, 1);
      const whiteArmy = createArmy(attack2UnitType, 1);
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
        { unit: unexpectedUnit, coordinate: 'E-6', facing: 'north' },
      ]);

      expect(eachUnitPresentOnce(whiteArmy, new Set(), board)).toBe(false);
    });

    it('should return false when board has unit with wrong instance number', () => {
      const unit1 = createExpectedUnit('white', attack2UnitType, 1);
      const wrongInstanceUnit = createUnitInstance('white', attack2UnitType, 3); // Should be 2
      const whiteArmy = createArmy(attack2UnitType, 2);
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
        { unit: wrongInstanceUnit, coordinate: 'E-6', facing: 'north' },
      ]);

      expect(eachUnitPresentOnce(whiteArmy, new Set(), board)).toBe(false);
    });
  });
});
