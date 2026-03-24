import { getPlayerUnitWithPosition } from '@queries';
import { describe, expect, it } from 'vitest';
import { createBoardWithCommander } from './boardWithCommander';
import { createBoardWithSingleUnit } from './boardWithSingleUnit';

/**
 * createBoardWithCommander: test helper; implementation in boardWithCommander.ts.
 */
describe('createBoardWithCommander', () => {
  it('should add commander to empty board', () => {
    const board = createBoardWithCommander('white', 'E-5');
    expect(board.board['E-5']?.commanders).toEqual(new Set(['white']));
  });

  it('should add commander to existing board when provided', () => {
    const base = createBoardWithSingleUnit('E-6', 'black');
    const board = createBoardWithCommander('white', 'E-5', base);
    expect(board.board['E-5']?.commanders).toEqual(new Set(['white']));
    expect(getPlayerUnitWithPosition(board, 'E-6', 'black')).toBeDefined();
  });
});
