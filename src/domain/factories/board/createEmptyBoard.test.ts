import { boardSchema } from '@entities';
import { coordinateLayoutMap } from '@ruleValues';
import { createEmptyBoard } from './createEmptyBoard';

/**
 * An empty board of any size: exactly the spaces its size lays out, each
 * open, level and unoccupied.
 */
describe('createEmptyBoard function', () => {
  it('holds exactly the spaces its size lays out, and says its size', () => {
    // Each size's board against that size's own list of spaces.
    for (const boardType of ['small', 'standard', 'large'] as const) {
      const board = createEmptyBoard(boardType);
      expect(board.boardType).toBe(boardType);
      expect(Object.keys(board.board).toSorted()).toStrictEqual(
        coordinateLayoutMap[boardType].coordinates.toSorted(),
      );
    }
  });

  it('starts every space empty: no unit and no commander', () => {
    // A fresh board has nobody on it before setup (§3.5).
    const board = createEmptyBoard('small');
    for (const space of Object.values(board.board)) {
      expect(space.unitPresence).toStrictEqual({ presenceType: 'none' });
      expect(space.commanders).toStrictEqual([]);
    }
  });

  it('satisfies boardSchema', () => {
    // A board this builds parses as a board.
    const board = createEmptyBoard('standard');
    expect(boardSchema.parse(board)).toStrictEqual(board);
  });
});
