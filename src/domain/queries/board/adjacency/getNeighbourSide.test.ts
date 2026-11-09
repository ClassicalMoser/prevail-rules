import { createEmptyStandardBoard } from '@factories';

import { getNeighbourSide } from './getNeighbourSide';

/**
 * A unit's eight neighbours sort into front, flank and back (§2.3.3). The
 * unit in every case stands on E-5 facing north.
 */
describe('getNeighbourSide function', () => {
  const board = createEmptyStandardBoard();

  it('the three spaces ahead are its front', () => {
    expect(getNeighbourSide(board, 'E-5', 'north', 'D-4')).toBe('front');
    expect(getNeighbourSide(board, 'E-5', 'north', 'D-5')).toBe('front');
    expect(getNeighbourSide(board, 'E-5', 'north', 'D-6')).toBe('front');
  });

  it('the two spaces at its shoulders are its flank', () => {
    expect(getNeighbourSide(board, 'E-5', 'north', 'E-4')).toBe('flank');
    expect(getNeighbourSide(board, 'E-5', 'north', 'E-6')).toBe('flank');
  });

  it('the three spaces behind are its back', () => {
    expect(getNeighbourSide(board, 'E-5', 'north', 'F-4')).toBe('back');
    expect(getNeighbourSide(board, 'E-5', 'north', 'F-5')).toBe('back');
    expect(getNeighbourSide(board, 'E-5', 'north', 'F-6')).toBe('back');
  });

  it('a diagonal facing turns the sides with it', () => {
    // Facing northEast, D-5 (north) is a front space and D-4 (northWest)
    // is now at the shoulder.
    expect(getNeighbourSide(board, 'E-5', 'northEast', 'D-5')).toBe('front');
    expect(getNeighbourSide(board, 'E-5', 'northEast', 'D-4')).toBe('flank');
  });

  it('a space two away is no neighbour at all', () => {
    expect(getNeighbourSide(board, 'E-5', 'north', 'C-5')).toBeUndefined();
  });
});
