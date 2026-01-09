import { describe, expect, it } from 'vitest';
import { addCommanderToBoard } from './addCommanderToBoard';
import { createEmptyStandardBoard } from './createEmptyBoard';

describe('addCommanderToBoard', () => {
  it('should add a commander to an empty space', () => {
    const board = createEmptyStandardBoard();
    const newBoard = addCommanderToBoard(board, 'white', 'E-5');
    expect(newBoard.board['E-5']?.commanders).toEqual(new Set(['white']));
  });
  it('should add a commander to a space with existing commanders', () => {
    const board = createEmptyStandardBoard();
    const newBoard = addCommanderToBoard(board, 'white', 'E-5');
    const newBoard2 = addCommanderToBoard(newBoard, 'black', 'E-5');
    expect(newBoard2.board['E-5']?.commanders).toEqual(
      new Set(['white', 'black']),
    );
  });
});
