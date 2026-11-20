import { addCommanderToBoard } from '@transforms';
import { createEmptyStandardBoard } from '@factories';

import { getCommanderSpaces } from './getCommanderSpaces';

/**
 * The space each side's commander stands in, read once per board.
 * Inspiration range is measured from it (§4.2.7).
 */
describe('getCommanderSpaces function', () => {
  it('gives each side the space its commander stands in', () => {
    // White's commander at E-5, Black's at H-9.
    const white = addCommanderToBoard(
      createEmptyStandardBoard(),
      'white',
      'E-5',
    );
    const board = addCommanderToBoard(white, 'black', 'H-9');
    const spaces = getCommanderSpaces(board);

    expect(spaces.get('white')).toBe('E-5');
    expect(spaces.get('black')).toBe('H-9');
  });

  it('gives no space to a side whose commander is not on the board', () => {
    // Only White's commander is placed; Black's has fallen, or never stood.
    const board = addCommanderToBoard(
      createEmptyStandardBoard(),
      'white',
      'E-5',
    );

    expect(getCommanderSpaces(board).has('black')).toBe(false);
  });

  it('reads a board once: asking again gives the same reading', () => {
    // A board is never written in place, so its first reading stands.
    const board = addCommanderToBoard(
      createEmptyStandardBoard(),
      'white',
      'E-5',
    );

    expect(getCommanderSpaces(board)).toBe(getCommanderSpaces(board));
  });
});
