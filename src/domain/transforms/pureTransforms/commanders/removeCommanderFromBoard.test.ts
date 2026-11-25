import { createEmptyStandardBoard } from '@factories';

import { addCommanderToBoard } from './addCommanderToBoard';
import { removeCommanderFromBoard } from './removeCommanderFromBoard';

/**
 * A commander lifted off its space leaves it; another side's commander
 * sharing that space, and every other space, stay as they were.
 */
describe('removeCommanderFromBoard function', () => {
  it('lifts the commander off its space, leaving the board it was given as it was', () => {
    // Black's commander stands alone on E-5.
    const board = addCommanderToBoard(
      createEmptyStandardBoard(),
      'black',
      'E-5',
    );

    const lifted = removeCommanderFromBoard(board, 'E-5', 'black');

    // E-5 is empty of commanders; the board it was lifted from still has it.
    expect(lifted.board['E-5']?.commanders).toStrictEqual([]);
    expect(board.board['E-5']?.commanders).toStrictEqual(['black']);
  });

  it('leaves the other side’s commander sharing the space', () => {
    // Both commanders stand on E-5: black's rode in with its unit (§4.3.10).
    const withWhite = addCommanderToBoard(
      createEmptyStandardBoard(),
      'white',
      'E-5',
    );
    const withBoth = addCommanderToBoard(withWhite, 'black', 'E-5');

    const lifted = removeCommanderFromBoard(withBoth, 'E-5', 'white');

    // Only white's is lifted; black's stays with its own unit.
    expect(lifted.board['E-5']?.commanders).toStrictEqual(['black']);
  });

  it('leaves a commander on another space where it stands', () => {
    // Black's commander on E-5, white's on D-4.
    const withBlack = addCommanderToBoard(
      createEmptyStandardBoard(),
      'black',
      'E-5',
    );
    const withBoth = addCommanderToBoard(withBlack, 'white', 'D-4');

    const lifted = removeCommanderFromBoard(withBoth, 'E-5', 'black');

    // White's on D-4 is untouched.
    expect(lifted.board['D-4']?.commanders).toStrictEqual(['white']);
  });

  it('throws when that side’s commander is not on the space', () => {
    // Only white's commander stands on E-5.
    const board = addCommanderToBoard(
      createEmptyStandardBoard(),
      'white',
      'E-5',
    );

    // Black's is not there to lift, though another commander is.
    expect(() => removeCommanderFromBoard(board, 'E-5', 'black')).toThrow(
      'Commander not present to remove',
    );
  });
});
