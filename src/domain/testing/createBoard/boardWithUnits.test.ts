import { findPlayerUnitWithPosition } from '@queries';
import { placed } from '@testing/testHelpers';
import { createTestUnit } from '@testing/unitHelpers';

import { createBoardWithUnits } from './boardWithUnits';

/** Units set down one at a time on a standard board, by the board's own writer. */
describe('createBoardWithUnits function', () => {
  it('stands each unit where its placement says', () => {
    const black = createTestUnit('black');
    const white = createTestUnit('white');

    const board = createBoardWithUnits([
      placed(black, 'E-5', 'north'),
      placed(white, 'E-6', 'south'),
    ]);

    expect(board.boardType).toBe('standard');
    expect(findPlayerUnitWithPosition(board, 'E-5', 'black')?.unit).toBe(black);
    expect(findPlayerUnitWithPosition(board, 'E-6', 'white')?.unit).toBe(white);
  });

  it('engages two enemy units given the same space', () => {
    const black = createTestUnit('black');
    const white = createTestUnit('white');

    const board = createBoardWithUnits([
      placed(black, 'E-5', 'north'),
      placed(white, 'E-5', 'south'),
    ]);

    expect(board.board['E-5']?.unitPresence.presenceType).toBe('engaged');
  });
});
