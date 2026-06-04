import { getPlayerUnitWithPosition } from '@queries';

import { createBoardWithCommander } from './boardWithCommander';
import { createBoardWithSingleUnit } from './boardWithSingleUnit';

/**
 * CreateBoardWithCommander: Creates a board with a commander at a coordinate.
 */
describe(createBoardWithCommander, () => {
  it('given add commander to empty board', () => {
    const board = createBoardWithCommander('white', 'E-5');
    expect(board.board['E-5']?.commanders).toStrictEqual(['white']);
  });

  it('given add commander to existing board when provided', () => {
    const base = createBoardWithSingleUnit('E-6', 'black');
    const board = createBoardWithCommander('white', 'E-5', base);
    expect(board.board['E-5']?.commanders).toStrictEqual(['white']);
    expect(getPlayerUnitWithPosition(board, 'E-6', 'black')).toBeDefined();
  });
});
