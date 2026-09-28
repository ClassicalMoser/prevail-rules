import type { Board, Coordinate } from '@entities';
import { createEmptySmallBoard, createEmptyStandardBoard } from '@factories';

import { getBoardSpace } from './getBoardSpace';

const standardBoard: Board = createEmptyStandardBoard();
const smallBoard: Board = createEmptySmallBoard();

/**
 * GetBoardSpace: looks up the tile record at a coordinate; throws if the coordinate is missing from the board
 * map or not a valid coordinate for that board shape.
 */
describe(getBoardSpace, () => {
  describe('standard board', () => {
    it('returns space with terrain, elevation, unitPresence when E-5', () => {
      const space = getBoardSpace(standardBoard, 'E-5');
      expect(space).toBeDefined();
      expect(space.terrainType).toBeDefined();
      expect(space.elevation).toBeDefined();
      expect(space.unitPresence).toBeDefined();
    });

    it('returns defined space when A-1', () => {
      const space = getBoardSpace(standardBoard, 'A-1');
      expect(space).toBeDefined();
    });

    it('returns defined space when L-18', () => {
      const space = getBoardSpace(standardBoard, 'L-18');
      expect(space).toBeDefined();
    });

    it('throws when the coordinate string is not on the standard board', () => {
      expect(() => {
        // Intentionally bad assertion to test the error message
        getBoardSpace(standardBoard, 'Y-55' as Coordinate);
      }).toThrow(
        new Error('Coordinate Y-55 does not exist on standard board.'),
      );
    });
  });

  describe('small board', () => {
    it('returns space with terrain, elevation, unitPresence when E-5', () => {
      const space = getBoardSpace(smallBoard, 'E-5');
      expect(space).toBeDefined();
      expect(space.terrainType).toBeDefined();
      expect(space.elevation).toBeDefined();
      expect(space.unitPresence).toBeDefined();
    });

    it('returns defined space when A-1', () => {
      const space = getBoardSpace(smallBoard, 'A-1');
      expect(space).toBeDefined();
    });

    it('returns defined space when H-12', () => {
      const space = getBoardSpace(smallBoard, 'H-12');
      expect(space).toBeDefined();
    });
  });
});
