import { createEmptyStandardBoard } from '@factories';

import { addCommanderToBoard } from './addCommanderToBoard';

/**
 * A commander set down on a space joins whatever already stands there:
 * commanders take up no room (§2.2.2).
 */
describe('addCommanderToBoard function', () => {
  it('sets a commander down on an empty space', () => {
    // White's commander is set down on E-5 of a bare board.
    const board = addCommanderToBoard(
      createEmptyStandardBoard(),
      'white',
      'E-5',
    );

    // It stands there alone.
    expect(board.board['E-5']?.commanders).toStrictEqual(['white']);
  });

  it('sets a commander down beside the other side’s commander on the same space', () => {
    // White's commander stands on E-5; black's rides in with its own unit
    // (§4.3.10).
    const withWhite = addCommanderToBoard(
      createEmptyStandardBoard(),
      'white',
      'E-5',
    );
    const withBoth = addCommanderToBoard(withWhite, 'black', 'E-5');

    // Both stand there, and the board black's was added to is untouched.
    expect(withBoth.board['E-5']?.commanders).toStrictEqual(['white', 'black']);
    expect(withWhite.board['E-5']?.commanders).toStrictEqual(['white']);
  });
});
