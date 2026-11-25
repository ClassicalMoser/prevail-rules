import { createEmptyStandardBoard } from '@factories';

import { getForwardSpacesToEdge } from './getForwardSpacesToEdge';

/**
 * Every space in a straight run from a space to the board edge, the start
 * left out. A line is looked for along such a run (§4.3.5), and the
 * half-planes ahead and behind are filled out with it (§2.3.3).
 */
describe('getForwardSpacesToEdge function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('runs straight down a column to the far edge', () => {
    // South from A-1, every space of column 1 after it, to row L.
    expect(getForwardSpacesToEdge(standardBoard, 'A-1', 'south')).toStrictEqual(
      new Set([
        'B-1',
        'C-1',
        'D-1',
        'E-1',
        'F-1',
        'G-1',
        'H-1',
        'I-1',
        'J-1',
        'K-1',
        'L-1',
      ]),
    );
  });

  it('runs along a diagonal until it meets a row edge', () => {
    // North-east from E-5 reaches row A, at A-9, long before column 18.
    expect(
      getForwardSpacesToEdge(standardBoard, 'E-5', 'northEast'),
    ).toStrictEqual(new Set(['D-6', 'C-7', 'B-8', 'A-9']));
  });

  it('runs along a diagonal until it meets a column edge', () => {
    // North-east from E-15 reaches column 18, at B-18, before row A.
    expect(
      getForwardSpacesToEdge(standardBoard, 'E-15', 'northEast'),
    ).toStrictEqual(new Set(['D-16', 'C-17', 'B-18']));
  });

  it('is empty from a space already at the edge it faces', () => {
    // Nothing lies north of row A.
    expect(getForwardSpacesToEdge(standardBoard, 'A-1', 'north')).toStrictEqual(
      new Set(),
    );
  });
});
