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

    it('should return base attack when in-play round effect has no modifier for that stat', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      // roundEffect exists (inspiration restriction present) but modifiers omit attack — only command modifiers apply when commanded
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

    it('should return base stat for white inPlay when no modifiers apply', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.white.inPlay = createTestCard({
        roundEffectModifiers: [{ type: 'speed', value: 1 }],
      });

      expect(getCurrentUnitStat(unit, 'attack', gameState)).toBe(2);
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
    it('should apply round effect modifier when trait and unit restriction lists are empty', () => {
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

  describe('active command modifiers', () => {
    it('should ignore command modifiers when no card is in play', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);

      const result = getCurrentUnitStat(unit, 'attack', gameState);

      expect(result).toBe(3);
    });

    it('should fall back to an empty command modifier list when modifiers are missing', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.black.inPlay = {
        ...createTestCard(),
        command: {
          ...createTestCard().command,
          modifiers: undefined as unknown as never[],
        },
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);

      expect(result).toBe(3);
    });

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

  describe('additional modifiers', () => {
    it('should apply a matching additional modifier', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);

      const result = getCurrentUnitStat(unit, 'attack', gameState, [
        { type: 'attack', value: 2 },
      ]);

      expect(result).toBe(5);
    });

    it('should apply defense additional modifiers to defense stats', () => {
      const unit = createTestUnit('black', { reverse: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);

      const result = getCurrentUnitStat(unit, 'reverse', gameState, [
        { type: 'defense', value: 1 },
      ]);

      expect(result).toBe(4);
    });

    it('should ignore additional modifiers that do not match the stat', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);

      const result = getCurrentUnitStat(unit, 'attack', gameState, [
        { type: 'speed', value: 1 },
      ]);

      expect(result).toBe(3);
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
});
