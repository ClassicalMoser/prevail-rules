import { createTestUnit, createUnitWithPlacement } from '@testing';

import { removeUnitFromReserve } from './removeUnitFromReserve';

import { createEmptyGameState, createUnitIndexKey } from '@factories';
import { addUnitToBoard } from './addUnitToBoard';
import { updateBoardState } from '../board/updateBoardState';
/**
 * RemoveUnitFromReserve: removeUnitFromReserve.
 */
describe('removeUnitFromReserve function', () => {
  describe('removing unit from reserve with one unit', () => {
    it('given remove unit and leave empty set', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = [unit];

      const newGameState = removeUnitFromReserve(gameState, unit);

      expect(newGameState).not.toBe(gameState);
      expect(newGameState.reservedUnits).toHaveLength(0);
    });

    it('given not mutate the original game state', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = [unit];

      removeUnitFromReserve(gameState, unit);

      expect(gameState.reservedUnits).toHaveLength(1);
      expect([...gameState.reservedUnits]).toContain(unit);
    });
  });

  describe('removing unit from reserve with multiple units', () => {
    it('given remove one unit and preserve others', () => {
      const gameState = createEmptyGameState('standard');
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      gameState.reservedUnits = [unit1, unit2];

      const newGameState = removeUnitFromReserve(gameState, unit1);

      expect(newGameState.reservedUnits).toHaveLength(1);
      expect([...newGameState.reservedUnits]).toContain(unit2);
      expect([...newGameState.reservedUnits]).not.toContain(unit1);
    });

    it('given remove by value equality when passing different reference', () => {
      const gameState = createEmptyGameState('standard');
      const unitInReserve = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      gameState.reservedUnits = [unitInReserve, unit2];
      const sameValueDifferentRef = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });

      const newGameState = removeUnitFromReserve(
        gameState,
        sameValueDifferentRef,
      );

      expect(newGameState.reservedUnits).toHaveLength(1);
      expect([...newGameState.reservedUnits]).toContain(unit2);
    });

    it('given removing from multiple units, does not mutate the original game state', () => {
      const gameState = createEmptyGameState('standard');
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      gameState.reservedUnits = [unit1, unit2];

      removeUnitFromReserve(gameState, unit1);

      expect(gameState.reservedUnits).toHaveLength(2);
      expect([...gameState.reservedUnits]).toContain(unit1);
      expect([...gameState.reservedUnits]).toContain(unit2);
    });
  });

  describe('error cases', () => {
    it('given error when unit not present in reserve, throws', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });

      expect(() => removeUnitFromReserve(gameState, unit)).toThrow(
        'Unit not present in reserve',
      );
    });

    it('given error when trying to remove unit with different instance number, throws', () => {
      const gameState = createEmptyGameState('standard');
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      gameState.reservedUnits = [unit1];

      expect(() => removeUnitFromReserve(gameState, unit2)).toThrow(
        'Unit not present in reserve',
      );
    });

    it('given error when trying to remove already removed unit, throws', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = [unit];
      const gameStateAfterRemoval = removeUnitFromReserve(gameState, unit);

      expect(() => removeUnitFromReserve(gameStateAfterRemoval, unit)).toThrow(
        'Unit not present in reserve',
      );
    });
  });

  describe('preserving other game state', () => {
    it('given preserve routed units', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = [unit];

      const newGameState = removeUnitFromReserve(gameState, unit);

      expect(newGameState.routedUnits).toBe(gameState.routedUnits);
    });
  });

  describe('the index of where every piece is', () => {
    it('given a unit already placed on the board, files it where it stands', () => {
      // Setup places the unit first, then takes it out of reserve.
      const placed = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
      });
      const gameState = {
        ...createEmptyGameState('standard'),
        reservedUnits: [placed.unit],
      };
      const onBoard = updateBoardState(
        gameState,
        addUnitToBoard(gameState.boardState, placed),
      );

      const newGameState = removeUnitFromReserve(onBoard, placed.unit);

      // Out of reserve, the index finds it only where it stands.
      expect(newGameState.index.units[createUnitIndexKey(placed.unit)]).toBe(
        'E-5',
      );
    });

    it('given a unit not yet placed, no longer files it anywhere', () => {
      // A reserve of one, taken away without placing it: the record now holds
      // the unit nowhere, and the index follows the record.
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = updateBoardState(
        { ...createEmptyGameState('standard'), reservedUnits: [unit] },
        createEmptyGameState('standard').boardState,
      );

      const newGameState = removeUnitFromReserve(gameState, unit);

      // It was filed as in reserve; now it is not filed at all.
      expect(gameState.index.units[createUnitIndexKey(unit)]).toBe('reserved');
      expect(
        Object.hasOwn(newGameState.index.units, createUnitIndexKey(unit)),
      ).toBe(false);
    });
  });
});
