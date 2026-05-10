import { addCommanderToBoard, createEmptyStandardBoard } from '@transforms';

import { getCommanderSpace } from './getCommanderSpace';

/**
 * GetCommanderSpace: looks up which board coordinate holds a player's commander, if any.
 */
describe(getCommanderSpace, () => {
  it('given commander on board, returns that space id', () => {
    let board = createEmptyStandardBoard();
    board = addCommanderToBoard(board, 'white', 'E-5');
    const space = getCommanderSpace('white', board);
    expect(space).toBe('E-5');
  });

  it('given no commander on board, returns undefined', () => {
    const board = createEmptyStandardBoard();
    const space = getCommanderSpace('white', board);
    expect(space).toBeUndefined();
  });
});
