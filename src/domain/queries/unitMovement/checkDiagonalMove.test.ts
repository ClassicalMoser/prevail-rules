import { createTestUnit } from '@testing';
import { canMoveInto } from '@validation';
import { describe, expect, it } from 'vitest';
import { getForwardSpace } from '../boardSpace';
import { createEmptyStandardBoard } from '../createEmptyBoard';
import { checkDiagonalMove } from './checkDiagonalMove';

describe('checkDiagonalMove', () => {
  const board = createEmptyStandardBoard();
  const unit = createTestUnit('black', { flexibility: 1 });

  describe('error cases', () => {
    it('should throw error when facing is not diagonal', () => {
      expect(() => {
        checkDiagonalMove(
          unit,
          board,
          'E-5',
          'D-5',
          'north', // Not diagonal
          getForwardSpace,
          canMoveInto,
        );
      }).toThrow(new Error('Facing must be diagonal'));
    });
  });

  describe('diagonal forward moves', () => {
    it('should allow diagonal move when orthogonal pass-through space is clear', () => {
      const result = checkDiagonalMove(
        unit,
        board,
        'E-5',
        'D-6', // northEast diagonal
        'northEast',
        getForwardSpace,
        canMoveInto,
      );

      // Should be able to continue and end
      expect(result.canContinue).toBe(true);
      expect(result.canEnd).toBe(true);
    });

    it('should block diagonal move when both orthogonal pass-through spaces are blocked', () => {
      const boardWithBlocked = createEmptyStandardBoard();
      // Block both orthogonal spaces (D-5 and E-4) with units that have insufficient combined flexibility
      // Unit has flexibility 1, friendly units have flexibility 1 each
      // Combined flexibility = 1 + 1 = 2, need 4+ to move through
      boardWithBlocked.board['D-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', { flexibility: 1, instanceNumber: 2 }),
        facing: 'north',
      };
      boardWithBlocked.board['E-6'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', { flexibility: 1, instanceNumber: 3 }),
        facing: 'north',
      };

      const result = checkDiagonalMove(
        unit,
        boardWithBlocked,
        'E-5',
        'D-6', // northEast diagonal
        'northEast',
        getForwardSpace,
        canMoveInto,
      );

      // Cannot make diagonal move (cannot pass through either orthogonal space)
      expect(result.canContinue).toBe(false);
      expect(result.canEnd).toBe(false);
    });

    it('should allow diagonal move when one orthogonal pass-through space is clear', () => {
      const boardWithPartialBlock = createEmptyStandardBoard();
      // Block one orthogonal space (D-5) with enemy but leave E-4 clear
      boardWithPartialBlock.board['D-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('white', { flexibility: 1 }),
        facing: 'north',
      };

      const result = checkDiagonalMove(
        unit,
        boardWithPartialBlock,
        'E-5',
        'D-4', // northEast diagonal
        'northEast',
        getForwardSpace,
        canMoveInto,
      );

      // Should be able to make diagonal move (can pass through E-4)
      expect(result.canContinue).toBe(true);
      expect(result.canEnd).toBe(true);
    });

    it('should handle diagonal move when target space cannot be moved through but can be ended at', () => {
      const boardWithEnemy = createEmptyStandardBoard();
      // Place enemy at target (D-4)
      boardWithEnemy.board['D-4'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('white', { flexibility: 1 }),
        facing: 'south',
      };

      const result = checkDiagonalMove(
        unit,
        boardWithEnemy,
        'E-5',
        'D-4', // northEast diagonal
        'northEast',
        getForwardSpace,
        (u, b, coord) => canMoveInto(u, b, coord), // Can engage enemy
      );

      // Can end at enemy space (engage) but cannot continue through
      expect(result.canContinue).toBe(false);
      expect(result.canEnd).toBe(true);
    });
  });

  describe('different diagonal facings', () => {
    it('should work for northWest diagonal', () => {
      const result = checkDiagonalMove(
        unit,
        board,
        'E-5',
        'D-6', // northWest diagonal
        'northWest',
        getForwardSpace,
        canMoveInto,
      );

      expect(result.canContinue).toBe(true);
      expect(result.canEnd).toBe(true);
    });

    it('should work for southEast diagonal', () => {
      const result = checkDiagonalMove(
        unit,
        board,
        'E-5',
        'F-4', // southEast diagonal
        'southEast',
        getForwardSpace,
        canMoveInto,
      );

      expect(result.canContinue).toBe(true);
      expect(result.canEnd).toBe(true);
    });

    it('should work for southWest diagonal', () => {
      const result = checkDiagonalMove(
        unit,
        board,
        'E-5',
        'F-6', // southWest diagonal
        'southWest',
        getForwardSpace,
        canMoveInto,
      );

      expect(result.canContinue).toBe(true);
      expect(result.canEnd).toBe(true);
    });
  });
});
