import { findPlayerUnitWithPosition } from '@queries';
import { createBoardWithCommander } from './boardWithCommander';
import { createBoardWithSingleUnit } from './boardWithSingleUnit';

/** A commander on a board is where its side's inspiration ranges are measured from. */
describe('createBoardWithCommander function', () => {
  it('stands the commander on the space, on an empty board when given none', () => {
    const board = createBoardWithCommander('white', 'E-5');

    expect(board.board['E-5']?.commanders).toStrictEqual(['white']);
  });

  it('keeps the units already on the board it is given', () => {
    // Black's unit on E-6, then White's commander beside it.
    const base = createBoardWithSingleUnit('E-6', 'black');

    const board = createBoardWithCommander('white', 'E-5', base);

    expect(board.board['E-5']?.commanders).toStrictEqual(['white']);
    expect(
      findPlayerUnitWithPosition(board, 'E-6', 'black')?.placement,
    ).toStrictEqual({ coordinate: 'E-6', facing: 'north' });
  });
});
