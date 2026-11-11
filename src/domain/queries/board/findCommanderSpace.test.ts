import { addCommanderToBoard } from '@transforms';
import { createEmptyStandardBoard } from '@factories';

import { findCommanderSpace } from './findCommanderSpace';

/**
 * GetCommanderSpace: looks up which board coordinate holds a player's commander, if any.
 */
describe('findCommanderSpace function', () => {
  it('finds the space where the commander stands', () => {
    let board = createEmptyStandardBoard();
    board = addCommanderToBoard(board, 'white', 'E-5');
    const space = findCommanderSpace('white', board);
    expect(space).toBe('E-5');
  });

  it('there is no commander space when the commander is off the board', () => {
    const board = createEmptyStandardBoard();
    const space = findCommanderSpace('white', board);
    expect(space).toBeUndefined();
  });
});
