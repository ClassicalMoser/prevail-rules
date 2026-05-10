import { createEmptyStandardBoard } from '@transforms/initializations';

import { addCommanderToBoard } from './addCommanderToBoard';

/**
 * AddCommanderToBoard: addCommanderToBoard.
 */
describe(addCommanderToBoard, () => {
  it('given add a commander to an empty space', () => {
    const board = createEmptyStandardBoard();
    const newBoard = addCommanderToBoard(board, 'white', 'E-5');
    expect(newBoard.board['E-5']?.commanders).toStrictEqual(new Set(['white']));
  });

  it('given add a commander to a space with existing commanders', () => {
    const board = createEmptyStandardBoard();
    const newBoard = addCommanderToBoard(board, 'white', 'E-5');
    const newBoard2 = addCommanderToBoard(newBoard, 'black', 'E-5');
    expect(newBoard2.board['E-5']?.commanders).toStrictEqual(
      new Set(['white', 'black']),
    );
  });
});
