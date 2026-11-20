import { createEmptyStandardBoard } from '@factories';
import { getSpacesInDirections } from './getSpacesInDirections';

/**
 * The spaces one step from a space in each of some directions, without any
 * that would be off the board.
 */
describe('getSpacesInDirections function', () => {
  // An empty standard board; only where spaces sit matters here.
  const board = createEmptyStandardBoard();

  it('finds one space in each direction asked', () => {
    // From E-5, north is D-5 and east is E-6.
    expect(
      getSpacesInDirections(board, 'E-5', ['north', 'east']),
    ).toStrictEqual(new Set(['D-5', 'E-6']));
  });

  it('leaves out a direction that steps off the board', () => {
    // From A-1, north and west lead off the board; only south is left.
    expect(
      getSpacesInDirections(board, 'A-1', ['north', 'west', 'south']),
    ).toStrictEqual(new Set(['B-1']));
  });

  it('finds nothing when asked no directions', () => {
    // No direction, no neighbour.
    expect(getSpacesInDirections(board, 'E-5', [])).toStrictEqual(new Set());
  });
});
