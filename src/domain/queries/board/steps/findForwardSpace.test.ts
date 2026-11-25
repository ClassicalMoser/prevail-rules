import type { Coordinate, UnitFacing } from '@entities';
import { createEmptySmallBoard, createEmptyStandardBoard } from '@factories';

import { findForwardSpace } from './findForwardSpace';

/**
 * A unit only ever steps the way it faces (§5.1.3). One step goes one space
 * that way, a diagonal facing changing row and column at once; a step past
 * the board edge finds no space, which is an ordinary answer; and a space the
 * board does not have is a fault, worded by which part of its name is wrong.
 */
describe('findForwardSpace function', () => {
  // The standard board, rows A to L and columns 1 to 18, holds most cases;
  // the small board, rows A to H and columns 1 to 12, shows each size has
  // its own edge.
  const standardBoard = createEmptyStandardBoard();
  const smallBoard = createEmptySmallBoard();

  describe('a step inside the board', () => {
    it('goes one row toward row A when facing north', () => {
      // North of G-10 is F-10, the same column.
      expect(findForwardSpace(standardBoard, 'G-10', 'north')).toBe('F-10');
    });

    it('goes one row away from row A when facing south', () => {
      // South of A-1 is B-1.
      expect(findForwardSpace(standardBoard, 'A-1', 'south')).toBe('B-1');
    });

    it('goes one column away from column 1 when facing east', () => {
      // East of A-1 is A-2, the same row.
      expect(findForwardSpace(standardBoard, 'A-1', 'east')).toBe('A-2');
    });

    it('goes one column toward column 1 when facing west', () => {
      // West of E-5 is E-4.
      expect(findForwardSpace(standardBoard, 'E-5', 'west')).toBe('E-4');
    });

    it('changes both row and column for each diagonal facing', () => {
      // Each diagonal is one row and one column at once, and a diagonal step
      // costs the same one Speed as a straight one (§5.1.2).
      expect(findForwardSpace(standardBoard, 'K-11', 'northEast')).toBe('J-12');
      expect(findForwardSpace(standardBoard, 'A-1', 'southEast')).toBe('B-2');
      expect(findForwardSpace(standardBoard, 'D-4', 'southWest')).toBe('E-3');
      expect(findForwardSpace(standardBoard, 'L-18', 'northWest')).toBe('K-17');
    });
  });

  describe('a step off the board edge', () => {
    it('finds no space past each of the four edges', () => {
      // North of row A, west of column 1, south of row L, east of column 18.
      expect(findForwardSpace(standardBoard, 'A-1', 'north')).toBeUndefined();
      expect(findForwardSpace(standardBoard, 'F-1', 'west')).toBeUndefined();
      expect(findForwardSpace(standardBoard, 'L-5', 'south')).toBeUndefined();
      expect(findForwardSpace(standardBoard, 'E-18', 'east')).toBeUndefined();
    });

    it('finds no space for a diagonal that leaves by its row alone', () => {
      // South-west of L-5 would be column 4, on the board, but row M is not.
      expect(
        findForwardSpace(standardBoard, 'L-5', 'southWest'),
      ).toBeUndefined();
    });

    it('finds no space for a diagonal that leaves by its column alone', () => {
      // North-west of F-1 would be row E, on the board, but column 0 is not.
      // Counted along the board's list of spaces, that step would land on
      // D-18, at the far end of another row.
      expect(
        findForwardSpace(standardBoard, 'F-1', 'northWest'),
      ).toBeUndefined();
    });

    it('finds no space past the small board edge where a larger board goes on', () => {
      // South of H-5 and east of E-12 are spaces of the standard board, but
      // the small board ends at row H and column 12.
      expect(findForwardSpace(smallBoard, 'H-5', 'south')).toBeUndefined();
      expect(findForwardSpace(smallBoard, 'E-12', 'east')).toBeUndefined();
    });
  });

  describe('a space this board does not have', () => {
    it('refuses a name not shaped row-dash-column', () => {
      // 'E5' has no dash, so it names no space. The cast is what reaches
      // the refusal, standing for bad input from outside.
      expect(() =>
        findForwardSpace(standardBoard, 'E5' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid coordinate: E5'));
    });

    it('refuses a row only a larger board has', () => {
      // Row R is on the large board, past the standard board's last row, L.
      expect(() => findForwardSpace(standardBoard, 'R-12', 'north')).toThrow(
        new Error('Invalid row: R'),
      );
      // Row I is one past the small board's last row, H.
      expect(() => findForwardSpace(smallBoard, 'I-5', 'north')).toThrow(
        new Error('Invalid row: I'),
      );
    });

    it('refuses a column only a larger board has', () => {
      // Column 19 is one past the standard board's last column, 18.
      expect(() => findForwardSpace(standardBoard, 'A-19', 'north')).toThrow(
        new Error('Invalid column: 19'),
      );
      // Column 13 is one past the small board's last column, 12.
      expect(() => findForwardSpace(smallBoard, 'A-13', 'north')).toThrow(
        new Error('Invalid column: 13'),
      );
    });

    it('refuses a row letter no board has', () => {
      // The large board's rows end at X, so Z is no row at all. The cast is
      // what reaches the refusal.
      expect(() =>
        findForwardSpace(standardBoard, 'Z-1' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid row: Z'));
    });

    it('refuses a column number no board has', () => {
      // Columns count from 1, so 0 is no column at all. The cast is what
      // reaches the refusal.
      expect(() =>
        findForwardSpace(standardBoard, 'A-0' as Coordinate, 'north'),
      ).toThrow(new Error('Invalid column: 0'));
    });

    it('refuses a facing that is none of the eight', () => {
      // 'random' is not a facing, so the cast is what reaches the refusal.
      expect(() =>
        findForwardSpace(standardBoard, 'E-9', 'random' as UnitFacing),
      ).toThrow(new Error('Invalid facing: random'));
    });
  });
});
