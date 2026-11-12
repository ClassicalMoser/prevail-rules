import type { Coordinate } from '@entities';
import { createEmptyStandardBoard } from '@factories';
import { getSpacesApart } from './getSpacesApart';
import { getSpacesWithinDistance } from './areas';

const board = createEmptyStandardBoard();

/**
 * GetSpacesApart: how far one space is from another, counting a diagonal
 * step as one, as an inspiration range is counted (§4.2.7).
 */
describe('getSpacesApart function', () => {
  it('is 0 from a space to itself', () => {
    // A range of 0 reaches only the commander's own space.
    expect(getSpacesApart(board, 'E-5', 'E-5')).toBe(0);
  });

  it('counts a diagonal step as one, like a straight one', () => {
    // E-5 to C-7 is two rows and two columns: two diagonal steps.
    expect(getSpacesApart(board, 'E-5', 'C-7')).toBe(2);
    // E-5 to E-7 is two steps along the row.
    expect(getSpacesApart(board, 'E-5', 'E-7')).toBe(2);
  });

  it('counts the longer of the row gap and the column gap', () => {
    // Three rows and one column apart: three steps.
    expect(getSpacesApart(board, 'E-5', 'B-6')).toBe(3);
  });

  it('is the same either way round', () => {
    expect(getSpacesApart(board, 'B-6', 'E-5')).toBe(3);
  });

  it('agrees with the spaces within each distance of E-5', () => {
    // Across the 7 by 7 square around E-5, a space is at most 2 apart
    // exactly when the ring-by-ring walk finds it within 2.
    const withinTwo = getSpacesWithinDistance(board, 'E-5', 2);
    const withinThree = getSpacesWithinDistance(board, 'E-5', 3);
    for (const space of withinThree) {
      expect(getSpacesApart(board, 'E-5', space) <= 2).toBe(
        withinTwo.has(space),
      );
    }
  });

  it('throws for a coordinate that is not on the board', () => {
    // No board has a row Z; the type would refuse it, so it is forced past
    // to stand for bad input from outside.
    expect(() =>
      getSpacesApart(board, 'E-5', 'Z-5' as unknown as Coordinate),
    ).toThrow('Invalid coordinate: Z-5');
  });
});
