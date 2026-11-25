import { createEmptyStandardBoard } from '@factories';

import { getFlankingSpaces } from './getFlankingSpaces';

/**
 * A unit's flanking spaces are two (§2.3.2): directly to its left and
 * right, 90° off its facing. Where a flank rests on the board edge, fewer
 * are on the board.
 */
describe('getFlankingSpaces function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is the two spaces along its row for a unit facing north', () => {
    // At E-5 facing north, its shoulders are E-4 and E-6.
    expect(getFlankingSpaces(standardBoard, 'E-5', 'north')).toStrictEqual(
      new Set(['E-4', 'E-6']),
    );
  });

  it('is the two spaces along the crossing diagonal for a unit facing a diagonal', () => {
    // At E-5 facing north-east, its shoulders are north-west and south-east.
    expect(getFlankingSpaces(standardBoard, 'E-5', 'northEast')).toStrictEqual(
      new Set(['D-4', 'F-6']),
    );
  });

  it('keeps the one flank on the board when the other rests on the edge', () => {
    // At D-1 facing north, the west flank would be column 0.
    expect(getFlankingSpaces(standardBoard, 'D-1', 'north')).toStrictEqual(
      new Set(['D-2']),
    );
  });

  it('is empty in a corner where both flanks leave the board', () => {
    // At A-1 facing north-west, its shoulders would be south-west and
    // north-east, both off the board.
    expect(getFlankingSpaces(standardBoard, 'A-1', 'northWest')).toStrictEqual(
      new Set(),
    );
  });
});
