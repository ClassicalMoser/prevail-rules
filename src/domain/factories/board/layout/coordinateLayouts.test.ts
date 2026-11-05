/**
 * Each board size's layout: its rows and columns, counted from A and 1, and
 * the spaces they name.
 */

import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from '../createEmptyBoard';
import { getCoordinateLayout } from './coordinateLayoutMap';
import { largeCoordinateLayout } from './largeCoordinateLayout';
import { smallCoordinateLayout } from './smallCoordinateLayout';
import { standardCoordinateLayout } from './standardCoordinateLayout';

describe('the small board layout', () => {
  it('counts rows A to H and columns 1 to 12 from zero', () => {
    expect(smallCoordinateLayout.getRowIndex('A')).toBe(0);
    expect(smallCoordinateLayout.getRowIndex('H')).toBe(7);
    expect(smallCoordinateLayout.getColumnIndex('1')).toBe(0);
    expect(smallCoordinateLayout.getColumnIndex('12')).toBe(11);
  });

  it('has no row I or column 13; they lie off the small board', () => {
    expect(smallCoordinateLayout.getRowIndex('I')).toBe(-1);
    expect(smallCoordinateLayout.getColumnIndex('13')).toBe(-1);
  });

  it('names the space at a row and column', () => {
    expect(smallCoordinateLayout.createCoordinate('H', '12')).toBe('H-12');
  });

  it('refuses to name a space off the small board, even one larger boards have', () => {
    expect(() => smallCoordinateLayout.createCoordinate('I', '1')).toThrow(
      'Invalid coordinate for small board: I-1',
    );
    expect(() => smallCoordinateLayout.createCoordinate('A', '13')).toThrow(
      'Invalid coordinate for small board: A-13',
    );
  });
});

describe('the standard board layout', () => {
  it('counts rows A to L and columns 1 to 18 from zero', () => {
    expect(standardCoordinateLayout.getRowIndex('A')).toBe(0);
    expect(standardCoordinateLayout.getRowIndex('L')).toBe(11);
    expect(standardCoordinateLayout.getColumnIndex('1')).toBe(0);
    expect(standardCoordinateLayout.getColumnIndex('18')).toBe(17);
  });

  it('has no row M or column 19; they lie off the standard board', () => {
    expect(standardCoordinateLayout.getRowIndex('M')).toBe(-1);
    expect(standardCoordinateLayout.getColumnIndex('19')).toBe(-1);
  });

  it('names the space at a row and column', () => {
    expect(standardCoordinateLayout.createCoordinate('L', '18')).toBe('L-18');
  });

  it('refuses to name a space off the standard board, even one the large board has', () => {
    expect(() => standardCoordinateLayout.createCoordinate('M', '1')).toThrow(
      'Invalid coordinate for standard board: M-1',
    );
    expect(() => standardCoordinateLayout.createCoordinate('A', '19')).toThrow(
      'Invalid coordinate for standard board: A-19',
    );
  });
});

describe('the large board layout', () => {
  it('counts rows A to X and columns 1 to 36 from zero', () => {
    expect(largeCoordinateLayout.getRowIndex('A')).toBe(0);
    expect(largeCoordinateLayout.getRowIndex('X')).toBe(23);
    expect(largeCoordinateLayout.getColumnIndex('1')).toBe(0);
    expect(largeCoordinateLayout.getColumnIndex('36')).toBe(35);
  });

  it('has no row Y or column 37; they lie off the large board', () => {
    expect(largeCoordinateLayout.getRowIndex('Y')).toBe(-1);
    expect(largeCoordinateLayout.getColumnIndex('37')).toBe(-1);
  });

  it('names the space at a row and column', () => {
    expect(largeCoordinateLayout.createCoordinate('X', '36')).toBe('X-36');
  });

  it('refuses to name a space off the large board', () => {
    expect(() => largeCoordinateLayout.createCoordinate('Y', '1')).toThrow(
      'Invalid coordinate for large board: Y-1',
    );
    expect(() => largeCoordinateLayout.createCoordinate('A', '37')).toThrow(
      'Invalid coordinate for large board: A-37',
    );
  });
});

describe('getCoordinateLayout function', () => {
  it("reads the layout of the board's size", () => {
    expect(getCoordinateLayout(createEmptySmallBoard())).toBe(
      smallCoordinateLayout,
    );
    expect(getCoordinateLayout(createEmptyStandardBoard())).toBe(
      standardCoordinateLayout,
    );
    expect(getCoordinateLayout(createEmptyLargeBoard())).toBe(
      largeCoordinateLayout,
    );
  });
});
