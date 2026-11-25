import { createEmptySmallBoard } from '@factories';

import { getBoardSpace } from './getBoardSpace';

// A board with a unit on it is built through `addUnitToBoard`, which reads
// the space through this subject, so the self-proof check keeps these cases
// to a board fresh from its factory.

/**
 * The space at a coordinate: its ground, its corners, and who stands on it.
 * Every space of the board's size is there, so asking for one the board does
 * not have is a fault.
 */
describe('getBoardSpace function', () => {
  it('is an empty space on a board nobody has deployed to', () => {
    // A small board fresh from its factory.
    const board = createEmptySmallBoard();

    // E-5 is there, and no unit stands on it.
    expect(getBoardSpace(board, 'E-5').unitPresence).toStrictEqual({
      presenceType: 'none',
    });
  });

  it('refuses a space only a larger board has', () => {
    // The small board ends at row H; I-1 is a space of the standard board.
    expect(() => getBoardSpace(createEmptySmallBoard(), 'I-1')).toThrow(
      new Error('Coordinate I-1 does not exist on small board.'),
    );
  });
});
