import { createTestUnit } from '@testing';

import { addUnitToRouted } from './addUnitToRouted';

import { createEmptyGameState } from '@factories';
/**
 * AddUnitToRouted: addUnitToRouted.
 */
describe(addUnitToRouted, () => {
  describe('adding unit to empty set', () => {
    it('given add unit to routed units set', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState).not.toBe(gameState);
      expect(newGameState.routedUnits).toHaveLength(1);
      expect([...newGameState.routedUnits]).toContain(unit);
    });

    it('given not mutate the original game state', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });

      addUnitToRouted(gameState, unit);

      expect(gameState.routedUnits).toHaveLength(0);
    });
  });

  describe('adding multiple units', () => {
    it('given add second unit while preserving first', () => {
      const gameState = createEmptyGameState('standard');
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      const gameStateWithUnit1 = addUnitToRouted(gameState, unit1);

      const newGameState = addUnitToRouted(gameStateWithUnit1, unit2);

      expect(newGameState.routedUnits).toHaveLength(2);
      expect([...newGameState.routedUnits]).toContain(unit1);
      expect([...newGameState.routedUnits]).toContain(unit2);
    });

    it('given adding second unit, does not mutate the original game state', () => {
      const gameState = createEmptyGameState('standard');
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      const gameStateWithUnit1 = addUnitToRouted(gameState, unit1);

      addUnitToRouted(gameStateWithUnit1, unit2);

      expect(gameStateWithUnit1.routedUnits).toHaveLength(1);
      expect([...gameStateWithUnit1.routedUnits]).toContain(unit1);
    });
  });

  describe('error cases', () => {
    it('given error when unit already routed, throws', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });
      const gameStateWithUnit = addUnitToRouted(gameState, unit);

      expect(() => addUnitToRouted(gameStateWithUnit, unit)).toThrow(
        'Unit already routed',
      );
    });

    it('given when adding different reference with same value (value equality), throws', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const gameStateWithUnit = addUnitToRouted(gameState, unit);
      const sameValueDifferentRef = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });

      expect(() =>
        addUnitToRouted(gameStateWithUnit, sameValueDifferentRef),
      ).toThrow('Unit already routed');
    });
  });

  describe('preserving other game state', () => {
    it('given preserve lost commanders', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState.lostCommanders).toBe(gameState.lostCommanders);
    });

    it('given preserve reserved units', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState.reservedUnits).toBe(gameState.reservedUnits);
    });

    it('given preserve board state', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState.boardState).toBe(gameState.boardState);
    });

    it('given preserve card state', () => {
      const gameState = createEmptyGameState('standard');
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState.cardState).toBe(gameState.cardState);
    });
  });
});
