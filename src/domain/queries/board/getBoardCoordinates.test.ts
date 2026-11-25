import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from '@factories';

import { getBoardCoordinates } from './getBoardCoordinates';

/**
 * Every space of a board's size (§2.1.3), listed row by row from the north
 * edge, each row from the west edge. That order means nothing in the game;
 * it is the board order `listInBoardOrder` writes sets down in.
 */
describe('getBoardCoordinates function', () => {
  it('lists the 96 spaces of the small board, 8 deep by 12 wide', () => {
    const coordinates = getBoardCoordinates(createEmptySmallBoard());

    // Eight rows of twelve.
    expect(coordinates).toHaveLength(96);
    // From the north-west corner to the south-east one.
    expect(coordinates[0]).toBe('A-1');
    expect(coordinates[95]).toBe('H-12');
  });

  it('lists the 216 spaces of the standard board, 12 deep by 18 wide', () => {
    const coordinates = getBoardCoordinates(createEmptyStandardBoard());

    // Twelve rows of eighteen.
    expect(coordinates).toHaveLength(216);
    // Row A runs from A-1 to A-18, and row B starts straight after it.
    expect(coordinates[0]).toBe('A-1');
    expect(coordinates[17]).toBe('A-18');
    expect(coordinates[18]).toBe('B-1');
    // The south-east corner comes last.
    expect(coordinates[215]).toBe('L-18');
  });

  it('lists the 864 spaces of the large board, 24 deep by 36 wide', () => {
    const coordinates = getBoardCoordinates(createEmptyLargeBoard());

    // Twenty-four rows of thirty-six.
    expect(coordinates).toHaveLength(864);
    // From the north-west corner to the south-east one.
    expect(coordinates[0]).toBe('A-1');
    expect(coordinates[863]).toBe('X-36');
  });
});
