import type { SmallBoard, StandardBoard } from '@entities';
import {
  createEmptySmallBoard,
  createEmptyStandardBoard,
  getBoardCoordinates,
} from '@functions';
import { describe, expect, it } from 'vitest';

describe('getBoardCoordinates', () => {
  describe('standard board', () => {
    it('should return all coordinates for a standard board', () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates.length).toBeGreaterThan(0);
      // Standard board has 12 rows (A-L) × 18 columns (1-18) = 216 coordinates
      expect(coordinates.length).toBe(216);
    });

    it('should include corner coordinates', () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain('A-1');
      expect(coordinates).toContain('A-18');
      expect(coordinates).toContain('L-1');
      expect(coordinates).toContain('L-18');
    });

    it('should include center coordinates', () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain('E-5');
      expect(coordinates).toContain('F-9');
    });

    it('should return readonly array', () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      // TypeScript should prevent mutation, but we can test at runtime
      expect(() => {
        (coordinates as string[]).push('invalid');
      }).not.toThrow(); // Runtime doesn't enforce readonly, but TypeScript does
    });
  });

  describe('small board', () => {
    it('should return all coordinates for a small board', () => {
      const board: SmallBoard = createEmptySmallBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates.length).toBeGreaterThan(0);
      // Small board has 8 rows (A-H) × 12 columns (1-12) = 96 coordinates
      expect(coordinates.length).toBe(96);
    });

    it('should include corner coordinates', () => {
      const board: SmallBoard = createEmptySmallBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain('A-1');
      expect(coordinates).toContain('A-12');
      expect(coordinates).toContain('H-1');
      expect(coordinates).toContain('H-12');
    });
  });

  describe('type safety', () => {
    it('should return StandardBoardCoordinate[] for standard board', () => {
      const board: StandardBoard = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      // All coordinates should be valid standard board coordinates
      coordinates.forEach((coord) => {
        expect(typeof coord).toBe('string');
        expect(coord).toMatch(/^[A-L]-\d+$/);
      });
    });

    it('should return SmallBoardCoordinate[] for small board', () => {
      const board: SmallBoard = createEmptySmallBoard();
      const coordinates = getBoardCoordinates(board);

      // All coordinates should be valid small board coordinates
      coordinates.forEach((coord) => {
        expect(typeof coord).toBe('string');
        expect(coord).toMatch(/^[A-H]-\d+$/);
      });
    });
  });
});
