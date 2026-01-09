import { addCommanderToBoard, createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getCommanderSpace } from './getCommanderSpace';

describe('getCommanderSpace', () => {
  it('should return the board space containing the commander for a given player side', () => {
    let board = createEmptyStandardBoard();
    board = addCommanderToBoard(board, 'white', 'E-5');
    const space = getCommanderSpace('white', board);
    expect(space).toBe('E-5');
  });

  it('should return undefined if the commander is not on the board', () => {
    const board = createEmptyStandardBoard();
    const space = getCommanderSpace('white', board);
    expect(space).toBeUndefined();
  });
});
