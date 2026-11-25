import type { Board } from '@entities';
import { coordinateLayoutMap } from '@ruleValues';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from '@factories';
import { findGridPosition } from './findGridPosition';

/**
 * Where a space sits on a board, or nothing when the space is not on it.
 * Sizes nest, so a space sits at the same row and column on every board it
 * is on.
 */
describe('findGridPosition function', () => {
  // One board of each size, to compare a space across them.
  const small = createEmptySmallBoard();
  const standard = createEmptyStandardBoard();
  const large = createEmptyLargeBoard();

  it('places a space at the same row and column on every board it is on', () => {
    // E-5 is the fifth row and fifth column of all three sizes.
    for (const board of [small, standard, large]) {
      expect(findGridPosition(board, 'E-5')).toStrictEqual({
        column: 4,
        row: 4,
      });
    }
  });

  it('finds no position for a space only a larger board has', () => {
    // Row I lies past the small board's last row, H; the standard board has it.
    expect(findGridPosition(small, 'I-1')).toBeUndefined();
    expect(findGridPosition(standard, 'I-1')).toStrictEqual({
      column: 0,
      row: 8,
    });
    // Column 13 lies past the small board's last column, 12.
    expect(findGridPosition(small, 'A-13')).toBeUndefined();
  });

  it("places every space of each size at its own place in that size's list", () => {
    // The layouts list their spaces row by row, so the space at place i sits
    // in row i ÷ frontage, the full rows before it, and column i mod
    // frontage, how far along its own row it is. This holds only because the
    // sizes nest: it is what lets one table of positions serve all three.
    const boards: Board[] = [small, standard, large];
    for (const board of boards) {
      const { frontage, coordinates } = coordinateLayoutMap[board.boardType];
      coordinates.forEach((coordinate, index) => {
        expect(findGridPosition(board, coordinate)).toStrictEqual({
          column: index % frontage,
          row: Math.floor(index / frontage),
        });
      });
    }
  });
});
