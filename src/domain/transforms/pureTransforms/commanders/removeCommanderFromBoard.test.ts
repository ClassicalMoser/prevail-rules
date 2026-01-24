import type { StandardBoardCoordinate } from '@entities';
import { describe, expect, it } from 'vitest';
import { addCommanderToBoard } from './addCommanderToBoard';
import { createEmptyStandardBoard } from '../../initializations/createEmptyBoard';
import { removeCommanderFromBoard } from './removeCommanderFromBoard';

describe('removeCommanderFromBoard', () => {
  const coordinate: StandardBoardCoordinate = 'E-5';

  describe('removing commander from space with one commander', () => {
    it('should remove commander and leave empty set', () => {
      const board = createEmptyStandardBoard();
      const boardWithCommander = addCommanderToBoard(
        board,
        'black',
        coordinate,
      );

      const newBoard = removeCommanderFromBoard(
        boardWithCommander,
        coordinate,
        'black',
      );

      expect(newBoard).not.toBe(boardWithCommander);
      expect(newBoard.board[coordinate]?.commanders).toEqual(new Set());
    });

    it('should not mutate the original board', () => {
      const board = createEmptyStandardBoard();
      const boardWithCommander = addCommanderToBoard(
        board,
        'white',
        coordinate,
      );

      removeCommanderFromBoard(boardWithCommander, coordinate, 'white');

      expect(boardWithCommander.board[coordinate]?.commanders).toEqual(
        new Set(['white']),
      );
    });
  });

  describe('removing commander from space with multiple commanders', () => {
    it('should remove one commander and leave the other', () => {
      const board = createEmptyStandardBoard();
      const boardWithWhite = addCommanderToBoard(board, 'white', coordinate);
      const boardWithBoth = addCommanderToBoard(
        boardWithWhite,
        'black',
        coordinate,
      );

      const newBoard = removeCommanderFromBoard(
        boardWithBoth,
        coordinate,
        'white',
      );

      expect(newBoard).not.toBe(boardWithBoth);
      expect(newBoard.board[coordinate]?.commanders).toEqual(
        new Set(['black']),
      );
    });

    it('should remove black commander and leave white', () => {
      const board = createEmptyStandardBoard();
      const boardWithWhite = addCommanderToBoard(board, 'white', coordinate);
      const boardWithBoth = addCommanderToBoard(
        boardWithWhite,
        'black',
        coordinate,
      );

      const newBoard = removeCommanderFromBoard(
        boardWithBoth,
        coordinate,
        'black',
      );

      expect(newBoard.board[coordinate]?.commanders).toEqual(
        new Set(['white']),
      );
    });

    it('should not mutate the original board when removing from multiple commanders', () => {
      const board = createEmptyStandardBoard();
      const boardWithWhite = addCommanderToBoard(board, 'white', coordinate);
      const boardWithBoth = addCommanderToBoard(
        boardWithWhite,
        'black',
        coordinate,
      );

      removeCommanderFromBoard(boardWithBoth, coordinate, 'white');

      expect(boardWithBoth.board[coordinate]?.commanders).toEqual(
        new Set(['white', 'black']),
      );
    });
  });

  describe('error cases', () => {
    it('should throw error when commander is not present', () => {
      const board = createEmptyStandardBoard();

      expect(() =>
        removeCommanderFromBoard(board, coordinate, 'black'),
      ).toThrow('Commander not present to remove');
    });

    it('should throw error when trying to remove wrong commander', () => {
      const board = createEmptyStandardBoard();
      const boardWithWhite = addCommanderToBoard(board, 'white', coordinate);

      expect(() =>
        removeCommanderFromBoard(boardWithWhite, coordinate, 'black'),
      ).toThrow('Commander not present to remove');
    });

    it('should throw error when trying to remove already removed commander', () => {
      const board = createEmptyStandardBoard();
      const boardWithCommander = addCommanderToBoard(
        board,
        'black',
        coordinate,
      );
      const boardAfterRemoval = removeCommanderFromBoard(
        boardWithCommander,
        coordinate,
        'black',
      );

      expect(() =>
        removeCommanderFromBoard(boardAfterRemoval, coordinate, 'black'),
      ).toThrow('Commander not present to remove');
    });
  });

  describe('preserving other board spaces', () => {
    it('should preserve commanders on other spaces', () => {
      const board = createEmptyStandardBoard();
      const otherCoord: StandardBoardCoordinate = 'D-4';
      const boardWithCommander1 = addCommanderToBoard(
        board,
        'black',
        coordinate,
      );
      const boardWithBoth = addCommanderToBoard(
        boardWithCommander1,
        'white',
        otherCoord,
      );

      const newBoard = removeCommanderFromBoard(
        boardWithBoth,
        coordinate,
        'black',
      );

      expect(newBoard.board[coordinate]?.commanders).toEqual(new Set());
      expect(newBoard.board[otherCoord]?.commanders).toEqual(
        new Set(['white']),
      );
    });

    it('should preserve units on other spaces', () => {
      const board = createEmptyStandardBoard();
      const otherCoord: StandardBoardCoordinate = 'D-4';
      const boardWithCommander = addCommanderToBoard(
        board,
        'black',
        coordinate,
      );
      // Add a unit to another space
      boardWithCommander.board[otherCoord] = {
        ...boardWithCommander.board[otherCoord]!,
        unitPresence: {
          presenceType: 'none',
        },
      };

      const newBoard = removeCommanderFromBoard(
        boardWithCommander,
        coordinate,
        'black',
      );

      expect(newBoard.board[otherCoord]?.unitPresence).toEqual({
        presenceType: 'none',
      });
    });
  });
});
