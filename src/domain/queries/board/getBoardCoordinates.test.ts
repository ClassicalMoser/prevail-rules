import type { Board } from '@entities';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from '@factories';

import { getBoardCoordinates } from './getBoardCoordinates';

/**
 * GetBoardCoordinates: flat list of every coordinate key on the board (standard 12×18; small 8×12).
 */
describe(getBoardCoordinates, () => {
  describe('standard board', () => {
    it('lists exactly 216 coordinates', () => {
      const board: Board = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates.length).toBeGreaterThan(0);
      expect(coordinates).toHaveLength(216);
    });

    it('includes the standard corners A-1, A-18, L-1, and L-18', () => {
      const board: Board = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain('A-1');
      expect(coordinates).toContain('A-18');
      expect(coordinates).toContain('L-1');
      expect(coordinates).toContain('L-18');
    });

    it('includes interior spaces such as E-5 and F-9', () => {
      const board: Board = createEmptyStandardBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain('E-5');
      expect(coordinates).toContain('F-9');
    });
  });

  describe('small board', () => {
    it('lists exactly 96 coordinates', () => {
      const board: Board = createEmptySmallBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates.length).toBeGreaterThan(0);
      expect(coordinates).toHaveLength(96);
    });

    it('includes the small-board corners A-1, A-12, H-1, and H-12', () => {
      const board: Board = createEmptySmallBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain('A-1');
      expect(coordinates).toContain('A-12');
      expect(coordinates).toContain('H-1');
      expect(coordinates).toContain('H-12');
    });
  });

  describe('large board', () => {
    it('lists exactly 864 coordinates', () => {
      const board: Board = createEmptyLargeBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates.length).toBeGreaterThan(0);
      expect(coordinates).toHaveLength(864);
    });

    it('includes the large-board corners A-1, A-36, X-1, and X-36', () => {
      const board: Board = createEmptyLargeBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain('A-1');
      expect(coordinates).toContain('A-36');
      expect(coordinates).toContain('X-1');
      expect(coordinates).toContain('X-36');
    });

    it('includes interior spaces such as M-5 and N-24', () => {
      const board: Board = createEmptyLargeBoard();
      const coordinates = getBoardCoordinates(board);

      expect(coordinates).toContain('M-5');
      expect(coordinates).toContain('N-24');
    });
  });
});
