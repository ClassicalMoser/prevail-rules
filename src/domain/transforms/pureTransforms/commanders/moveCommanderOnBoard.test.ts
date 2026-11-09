import { createEmptyStandardBoard } from '@factories';

import { addCommanderToBoard } from './addCommanderToBoard';
import { moveCommanderOnBoard } from './moveCommanderOnBoard';

/**
 * A commander changes spaces: black's stands on E-5 and moves to C-5.
 */
describe('moveCommanderOnBoard function', () => {
  const board = addCommanderToBoard(createEmptyStandardBoard(), 'black', 'E-5');

  it('the commander leaves its space and stands on the new one', () => {
    const moved = moveCommanderOnBoard(board, 'black', 'E-5', 'C-5');

    expect(moved.board['E-5']?.commanders).toStrictEqual([]);
    expect(moved.board['C-5']?.commanders).toStrictEqual(['black']);
  });

  it('the other side’s commander in the same space stays put', () => {
    const shared = addCommanderToBoard(board, 'white', 'E-5');

    const moved = moveCommanderOnBoard(shared, 'black', 'E-5', 'C-5');

    expect(moved.board['E-5']?.commanders).toStrictEqual(['white']);
  });
});
