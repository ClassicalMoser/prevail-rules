import type {
  SmallBoard,
  StandardBoard,
  StandardBoardCoordinate,
} from '@entities';
import { createEmptySmallBoard, createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getBoardSpace } from './getBoardSpace';

const standardBoard: StandardBoard = createEmptyStandardBoard();
const smallBoard: SmallBoard = createEmptySmallBoard();

describe('getBoardSpace', () => {
  describe('standard board', () => {
    it('should return the board space for a valid coordinate', () => {
      const space = getBoardSpace(standardBoard, 'E-5');
      expect(space).toBeDefined();
      expect(space.terrainType).toBeDefined();
      expect(space.elevation).toBeDefined();
      expect(space.unitPresence).toBeDefined();
    });

    it('should return the board space for A-1', () => {
      const space = getBoardSpace(standardBoard, 'A-1');
      expect(space).toBeDefined();
    });

    it('should return the board space for L-18', () => {
      const space = getBoardSpace(standardBoard, 'L-18');
      expect(space).toBeDefined();
    });

    it('should throw an error if the coordinate does not exist on the board', () => {
      // Create a board with a missing coordinate by manipulating the board object
      const boardWithMissingSpace: StandardBoard = {
        ...standardBoard,
        board: {
          ...standardBoard.board,
        },
      };
      // Remove a coordinate to simulate it not existing
      delete boardWithMissingSpace.board['E-5' as StandardBoardCoordinate];

      expect(() => {
        getBoardSpace(boardWithMissingSpace, 'E-5');
      }).toThrow(new Error('Coordinate E-5 does not exist on standard board.'));
    });

    it('should throw an error if the coordinate is not a valid standard board coordinate', () => {
      expect(() => {
        getBoardSpace(standardBoard, 'Y-55' as StandardBoardCoordinate);
      }).toThrow(
        new Error('Coordinate Y-55 does not exist on standard board.'),
      );
    });
  });

  describe('small board', () => {
    it('should return the board space for a valid coordinate', () => {
      const space = getBoardSpace(smallBoard, 'E-5');
      expect(space).toBeDefined();
      expect(space.terrainType).toBeDefined();
      expect(space.elevation).toBeDefined();
      expect(space.unitPresence).toBeDefined();
    });

    it('should return the board space for A-1', () => {
      const space = getBoardSpace(smallBoard, 'A-1');
      expect(space).toBeDefined();
    });

    it('should return the board space for H-12', () => {
      const space = getBoardSpace(smallBoard, 'H-12');
      expect(space).toBeDefined();
    });
  });
});
