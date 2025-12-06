import type { StandardBoardCoordinate, UnitFacing } from '@entities';
import type { MoveUnitEvent } from '@events';
import { createBoardWithUnits, getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@utils';
import { describe, expect, it } from 'vitest';
import { isLegalMove } from './isLegalMove';

describe('isLegalMove', () => {
  // Use stat-based lookup instead of name to avoid brittleness
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);

  describe('valid moves', () => {
    it('should return true for staying in place', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const coordinate: StandardBoardCoordinate = 'E-5';
      const facing: UnitFacing = 'north';
      const board = createBoardWithUnits([{ unit, coordinate, facing }]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate, facing },
        to: { coordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(true);
    });

    it('should return true for moving forward', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'E-5';
      const toCoordinate: StandardBoardCoordinate = 'D-5';
      const facing: UnitFacing = 'north';
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(true);
    });

    it('should return true for changing facing without moving', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const coordinate: StandardBoardCoordinate = 'E-5';
      const fromFacing: UnitFacing = 'north';
      const toFacing: UnitFacing = 'east';
      const board = createBoardWithUnits([
        { unit, coordinate, facing: fromFacing },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate, facing: fromFacing },
        to: { coordinate, facing: toFacing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(true);
    });

    it('should return true for engaging enemy from flank', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'E-4';
      const toCoordinate: StandardBoardCoordinate = 'E-5';
      const facing: UnitFacing = 'east';
      const enemyUnit = createUnitInstance('white', flexibility1UnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: toCoordinate, facing: 'north' },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(true);
    });

    it('should return true for engaging enemy from front with correct facing', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'D-5';
      const toCoordinate: StandardBoardCoordinate = 'E-5';
      const facing: UnitFacing = 'south'; // Facing opposite to enemy (enemy faces north)
      const enemyUnit = createUnitInstance('white', flexibility1UnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: toCoordinate, facing: 'north' },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(true);
    });
  });

  describe('invalid moves', () => {
    it('should return false for moving to invalid coordinate', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'E-5';
      // Invalid coordinate with intentionally unsafe casting
      const toCoordinate: StandardBoardCoordinate =
        'Z-99' as StandardBoardCoordinate;
      const facing: UnitFacing = 'north';
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate as StandardBoardCoordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(false);
    });

    it('should return false for moving beyond speed limit', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'E-5';
      const toCoordinate: StandardBoardCoordinate = 'B-5'; // 3 spaces away (beyond speed 2)
      const facing: UnitFacing = 'north';
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(false);
    });

    it('should return false for moving to friendly unit', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'E-5';
      const toCoordinate: StandardBoardCoordinate = 'D-5';
      const facing: UnitFacing = 'north';
      const friendlyUnit = createUnitInstance('black', flexibility1UnitType, 2);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: friendlyUnit, coordinate: toCoordinate, facing },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(false);
    });

    it('should return false for moving through enemy unit', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'E-5';
      const toCoordinate: StandardBoardCoordinate = 'C-5'; // Beyond enemy at D-5
      const facing: UnitFacing = 'north';
      const enemyUnit = createUnitInstance('white', flexibility1UnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: 'D-5', facing: 'south' },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(false);
    });

    it('should return false for engaging enemy from front with wrong facing', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'D-5';
      const toCoordinate: StandardBoardCoordinate = 'E-5';
      const facing: UnitFacing = 'north'; // Wrong facing (should be south to face opposite enemy)
      const enemyUnit = createUnitInstance('white', flexibility1UnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: toCoordinate, facing: 'north' },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(false);
    });

    it('should return false for engaging enemy from front without flexibility to rotate', () => {
      // Use stat-based lookup: flexibility 1 (Spearmen)
      const lowFlexibilityUnitType = getUnitByStatValue('flexibility', 1);
      const unit = createUnitInstance('black', lowFlexibilityUnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'D-5';
      const toCoordinate: StandardBoardCoordinate = 'E-5';
      const facing: UnitFacing = 'east'; // Coming from angle, needs flexibility to rotate
      const enemyUnit = createUnitInstance('white', flexibility1UnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: fromCoordinate, facing },
        { unit: enemyUnit, coordinate: toCoordinate, facing: 'north' },
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      expect(isLegalMove(moveUnitEvent, board)).toBe(false);
    });

    it('should return false when getLegalUnitMoves throws (invalid starting position)', () => {
      // Test coverage for catch block: when getLegalUnitMoves throws
      // This tests the case where the unit is not at the reported starting position
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const fromCoordinate: StandardBoardCoordinate = 'E-5';
      const toCoordinate: StandardBoardCoordinate = 'D-5';
      const facing: UnitFacing = 'north';
      // Create board with unit at a different coordinate than the "from" position
      const board = createBoardWithUnits([
        { unit, coordinate: 'F-5', facing }, // Unit is at F-5, but command says from E-5
      ]);

      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: fromCoordinate, facing },
        to: { coordinate: toCoordinate, facing },
      };

      // getLegalUnitMoves will throw because unit is not at the starting position
      expect(isLegalMove(moveUnitEvent, board)).toBe(false);
    });
  });
});
