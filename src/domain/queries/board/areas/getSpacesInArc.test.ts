import { createEmptySmallBoard, createEmptyStandardBoard } from '@factories';

import { getSpacesInArc } from './getSpacesInArc';

/**
 * GetSpacesInArc: ranged-attack style arc: spaces within range along front spread, bounded by board.
 */
describe(getSpacesInArc, () => {
  const board = createEmptyStandardBoard();
  const smallBoard = createEmptySmallBoard();

  it('nothing lies in the arc of a north-facing unit at A-5', () => {
    // The first rank is off the board, so later ranks never start.
    expect(getSpacesInArc(board, 'A-5', 'north', 2)).toStrictEqual(new Set());
  });

  describe('orthogonal facings, standard board', () => {
    it('range 2 north from B-5 is A-4, A-5, and A-6', () => {
      const spacesInArc = getSpacesInArc(board, 'B-5', 'north', 2);
      expect(spacesInArc).toStrictEqual(new Set(['A-4', 'A-5', 'A-6']));
    });

    it('range 2 east from B-5 steps out to column 7', () => {
      const spacesInArc = getSpacesInArc(board, 'B-5', 'east', 2);
      expect(spacesInArc).toStrictEqual(
        new Set(['A-6', 'B-6', 'C-6', 'A-7', 'B-7', 'C-7', 'D-7']),
      );
    });

    it('range 2 south from E-7 widens on the second rank', () => {
      const spacesInArc = getSpacesInArc(board, 'E-7', 'south', 2);
      expect(spacesInArc).toStrictEqual(
        new Set(['F-6', 'F-7', 'F-8', 'G-5', 'G-6', 'G-7', 'G-8', 'G-9']),
      );
    });
  });

  describe('diagonal facings, standard board', () => {
    it('range 1 northEast from E-7 is D-7, D-8, and E-8', () => {
      const spacesInArc = getSpacesInArc(board, 'E-7', 'northEast', 1);
      expect(spacesInArc).toStrictEqual(new Set(['D-7', 'D-8', 'E-8']));
    });

    it('range 3 southEast from B-10 extends through row E', () => {
      const spacesInArc = getSpacesInArc(board, 'B-10', 'southEast', 3);
      expect(spacesInArc).toStrictEqual(
        new Set([
          'B-11',
          'B-12',
          'B-13',
          'C-10',
          'C-11',
          'C-12',
          'C-13',
          'D-10',
          'D-11',
          'D-12',
          'D-13',
          'E-10',
          'E-11',
          'E-12',
          'E-13',
        ]),
      );
    });
  });

  describe('small board edge', () => {
    it('clips to in-bounds when facing southWest from H-12 with range 2', () => {
      const spacesInArc = getSpacesInArc(smallBoard, 'H-12', 'southWest', 2);
      expect(spacesInArc).toStrictEqual(new Set(['H-10', 'H-11']));
    });
  });
});
