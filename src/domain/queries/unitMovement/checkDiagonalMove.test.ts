import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState, createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { checkDiagonalMove } from './checkDiagonalMove';

describe('checkDiagonalMove', () => {
  const gameState: GameState<StandardBoard> = createEmptyGameState();
  const unit = createTestUnit('black', { flexibility: 1 });

  describe('error cases', () => {
    it('should throw error when facing is not diagonal', () => {
      expect(() => {
        checkDiagonalMove(
          unit,
          gameState,
          'E-5',
          'D-5',
          'north', // Not diagonal
        );
      }).toThrow(new Error('Facing must be diagonal'));
    });
  });

  describe('diagonal forward moves', () => {
    it('should allow diagonal move when orthogonal pass-through space is clear', () => {
      const result = checkDiagonalMove(
        unit,
        gameState,
        'E-5',
        'D-6', // northEast diagonal
        'northEast',
      );

      // Should be able to continue through
      expect(result).toBe(true);
    });

    it('should block diagonal move when both orthogonal pass-through spaces are blocked', () => {
      const gameStateWithBlocked = createEmptyGameState();
      // Block both orthogonal spaces (D-5 and E-6) with units that have insufficient combined flexibility
      // Unit has flexibility 1, friendly units have flexibility 1 each
      // Combined flexibility = 1 + 1 = 2, need 4+ to move through
      gameStateWithBlocked.boardState.board['D-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', { flexibility: 1, instanceNumber: 2 }),
        facing: 'north',
      };
      gameStateWithBlocked.boardState.board['E-6'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', { flexibility: 1, instanceNumber: 3 }),
        facing: 'north',
      };

      const result = checkDiagonalMove(
        unit,
        gameStateWithBlocked,
        'E-5',
        'D-6', // northEast diagonal
        'northEast',
      );

      // Cannot make diagonal move (cannot pass through either orthogonal space)
      expect(result).toBe(false);
    });

    it('should allow diagonal move when one orthogonal pass-through space is clear', () => {
      const gameStateWithPartialBlock = createEmptyGameState();
      // Block one orthogonal space (D-5) with enemy but leave E-6 clear
      gameStateWithPartialBlock.boardState.board['D-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('white', { flexibility: 1 }),
        facing: 'north',
      };

      const result = checkDiagonalMove(
        unit,
        gameStateWithPartialBlock,
        'E-5',
        'D-6', // northEast diagonal
        'northEast',
      );

      // Should be able to make diagonal move (can pass through E-6)
      expect(result).toBe(true);
    });

    it('should block diagonal move when target space cannot be moved through', () => {
      const gameStateWithEnemy = createEmptyGameState();
      // Place enemy at target (D-4)
      gameStateWithEnemy.boardState.board['D-4'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('white', { flexibility: 1 }),
        facing: 'south',
      };

      const result = checkDiagonalMove(
        unit,
        gameStateWithEnemy,
        'E-5',
        'D-4', // northEast diagonal
        'northEast',
      );

      // Cannot continue through enemy space
      expect(result).toBe(false);
    });
  });

  describe('different diagonal facings', () => {
    it('should work for northWest diagonal', () => {
      const result = checkDiagonalMove(
        unit,
        gameState,
        'E-5',
        'D-4', // northWest diagonal
        'northWest',
      );

      expect(result).toBe(true);
    });

    it('should work for southEast diagonal', () => {
      const result = checkDiagonalMove(
        unit,
        gameState,
        'E-5',
        'F-6', // southEast diagonal
        'southEast',
      );

      expect(result).toBe(true);
    });

    it('should work for southWest diagonal', () => {
      const result = checkDiagonalMove(
        unit,
        gameState,
        'E-5',
        'F-4', // southWest diagonal
        'southWest',
      );

      expect(result).toBe(true);
    });
  });
});
