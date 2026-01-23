import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { addCommanderToLostCommanders } from './addCommanderToLostCommanders';

describe('addCommanderToLostCommanders', () => {
  describe('adding commander to empty set', () => {
    it('should add commander to lost commanders set', () => {
      const gameState = createEmptyGameState();

      const newGameState = addCommanderToLostCommanders(gameState, 'black');

      expect(newGameState).not.toBe(gameState);
      expect(newGameState.lostCommanders).toEqual(new Set(['black']));
    });

    it('should not mutate the original game state', () => {
      const gameState = createEmptyGameState();

      addCommanderToLostCommanders(gameState, 'white');

      expect(gameState.lostCommanders).toEqual(new Set());
    });
  });

  describe('adding multiple commanders', () => {
    it('should add second commander while preserving first', () => {
      const gameState = createEmptyGameState();
      const gameStateWithBlack = addCommanderToLostCommanders(
        gameState,
        'black',
      );

      const newGameState = addCommanderToLostCommanders(
        gameStateWithBlack,
        'white',
      );

      expect(newGameState.lostCommanders).toEqual(new Set(['black', 'white']));
    });

    it('should not mutate the original game state when adding second commander', () => {
      const gameState = createEmptyGameState();
      const gameStateWithBlack = addCommanderToLostCommanders(
        gameState,
        'black',
      );

      addCommanderToLostCommanders(gameStateWithBlack, 'white');

      expect(gameStateWithBlack.lostCommanders).toEqual(new Set(['black']));
    });
  });

  describe('error cases', () => {
    it('should throw error when commander already lost', () => {
      const gameState = createEmptyGameState();
      const gameStateWithBlack = addCommanderToLostCommanders(
        gameState,
        'black',
      );

      expect(() =>
        addCommanderToLostCommanders(gameStateWithBlack, 'black'),
      ).toThrow('Commander already lost');
    });

    it('should throw error when trying to add already lost white commander', () => {
      const gameState = createEmptyGameState();
      const gameStateWithWhite = addCommanderToLostCommanders(
        gameState,
        'white',
      );

      expect(() =>
        addCommanderToLostCommanders(gameStateWithWhite, 'white'),
      ).toThrow('Commander already lost');
    });
  });

  describe('preserving other game state', () => {
    it('should preserve routed units', () => {
      const gameState = createEmptyGameState();
      const newGameState = addCommanderToLostCommanders(gameState, 'black');

      expect(newGameState.routedUnits).toBe(gameState.routedUnits);
    });

    it('should preserve reserved units', () => {
      const gameState = createEmptyGameState();

      const newGameState = addCommanderToLostCommanders(gameState, 'black');

      expect(newGameState.reservedUnits).toBe(gameState.reservedUnits);
    });

    it('should preserve board state', () => {
      const gameState = createEmptyGameState();

      const newGameState = addCommanderToLostCommanders(gameState, 'black');

      expect(newGameState.boardState).toBe(gameState.boardState);
    });

    it('should preserve card state', () => {
      const gameState = createEmptyGameState();

      const newGameState = addCommanderToLostCommanders(gameState, 'black');

      expect(newGameState.cardState).toBe(gameState.cardState);
    });
  });
});
