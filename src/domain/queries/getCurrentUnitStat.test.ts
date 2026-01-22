// TODO: Generated test suite: still needs manual review.

import {
  createBoardWithCommander,
  createBoardWithUnits,
  createEmptyGameState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getCurrentUnitStat } from './getCurrentUnitStat';

describe('getCurrentUnitStat', () => {
  describe('base stat without modifiers', () => {
    it('should return base stat when no card is in play', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });

    it('should return base stat when card has no round effect', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.black.inPlay = createTestCard({
        id: '2',
        name: 'Command Card 2',
        initiative: 2,
        modifiers: [{ type: 'attack', value: 1 }],
        roundEffectModifiers: [],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });
  });

  describe('round effect modifiers', () => {
    it('should apply round effect modifier without restrictions', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: 2 }],
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(5); // 3 base + 2 modifier
    });

    it('should not apply round effect modifier when unit does not match stat', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'speed', value: 1 }], // Different stat
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });

    it('should apply defense modifier to any defense stat', () => {
      const unit = createTestUnit('black', { reverse: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'defense', value: 1 }],
      });

      const result = getCurrentUnitStat(unit, 'reverse', gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });
  });

  describe('round effect with inspiration range restriction', () => {
    it('should apply modifier when unit is within inspiration range', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.boardState = createBoardWithCommander(
        'black',
        'E-6',
        gameState.boardState,
      );
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });

    it('should not apply modifier when unit is outside inspiration range', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.boardState = createBoardWithCommander(
        'black',
        'E-8',
        gameState.boardState,
      );
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });

    it('should not apply modifier when commander is not on board', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied (commander defeated)
    });
  });

  describe('round effect with unit restrictions', () => {
    it('should apply modifier when unit matches trait restrictions', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: 1 }],
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });

    it('should not apply modifier when unit does not match unit restrictions', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: 1 }],
        roundEffectRestrictions: { unitRestrictions: ['different-unit-id'] },
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });
  });

  describe('round effect with combined restrictions', () => {
    it('should apply modifier when all restrictions are satisfied', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.boardState = createBoardWithCommander(
        'black',
        'E-6',
        gameState.boardState,
      );
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });

    it('should not apply modifier when inspiration range restriction is not satisfied', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.boardState = createBoardWithCommander(
        'black',
        'E-8',
        gameState.boardState,
      );
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });
  });

  describe('active command modifiers', () => {
    it('should apply command modifier when unit was commanded', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.black.inPlay = createTestCard({
        commandModifiers: [{ type: 'attack', value: 2 }],
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(5); // 3 base + 2 modifier
    });

    it('should not apply command modifier when unit was not commanded', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set(); // Empty
      gameState.cardState.black.inPlay = createTestCard({
        commandModifiers: [{ type: 'attack', value: 2 }],
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });

    it('should not apply command modifier when stat does not match', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.black.inPlay = createTestCard({
        commandModifiers: [{ type: 'speed', value: 1 }], // Different stat
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });
  });

  describe('multiple modifiers stacking', () => {
    it('should stack round effect and command modifiers', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.black.inPlay = createTestCard({
        commandModifiers: [{ type: 'attack', value: 1 }],
        roundEffectModifiers: [{ type: 'attack', value: 2 }],
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(6); // 3 base + 2 round effect + 1 command
    });
  });

  describe('edge cases', () => {
    it('should throw error when unit is not on board and inspiration range is required', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      // Unit not placed on board
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: 1 }],
        roundEffectRestrictions: { inspirationRangeRestriction: 1 },
      });

      expect(() => {
        getCurrentUnitStat(unit, 'attack', gameState);
      }).toThrow('Unit not found on board');
    });

    it('should handle negative modifiers', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.black.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'attack', value: -1 }],
      });

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(2); // 3 base - 1 modifier
    });
  });
});
