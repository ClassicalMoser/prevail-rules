/**
 * The grid for a board's size: one shared grid per size, chosen by the
 * board's `boardType`.
 */

import { createEmptyLargeBoard } from '../createEmptyLargeBoard';
import { createEmptySmallBoard } from '../createEmptySmallBoard';
import { createEmptyStandardBoard } from '../createEmptyStandardBoard';
import { getCoordinateGrid } from './coordinateGridMap';

describe('getCoordinateGrid function', () => {
  it('gives each board size the grid of its own spaces', () => {
    // Small is 8 × 12, standard 12 × 18, large 24 × 36 (rulebook §2.1.3).
    expect(getCoordinateGrid(createEmptySmallBoard()).coordinates).toHaveLength(
      96,
    );
    expect(
      getCoordinateGrid(createEmptyStandardBoard()).coordinates,
    ).toHaveLength(216);
    expect(getCoordinateGrid(createEmptyLargeBoard()).coordinates).toHaveLength(
      864,
    );
  });

  it('shares one grid between two boards of the same size', () => {
    // Nothing in play changes a size's spaces, so the grid is built once.
    const first = getCoordinateGrid(createEmptySmallBoard());
    const second = getCoordinateGrid(createEmptySmallBoard());
    expect(second).toBe(first);
  });
});
