import type { Coordinate } from '@entities';
import type { LegalLine } from './getLegalLines';
import {
  createBoardWithFacingRow,
  createTestCommand,
  replaceBoard,
} from '@testing';

import { getLegalLinesToOrder } from './getLegalLinesToOrder';

import { createEmptyGameState } from '@factories';

/**
 * A lines command is that many separate orders, each to one line (§4.3.3),
 * offered a line at a time. No line may take in a unit a line already chosen
 * orders (§4.3.6), and the player may stop at any point, forfeiting the rest.
 *
 * Black has a rank of four, E-1 to E-4, facing north, and a command for up
 * to two lines with no range limit, so any stretch of the rank is a line.
 */
describe('getLegalLinesToOrder function', () => {
  const upToTwoLines = createTestCommand({
    number: 2,
    restrictions: { inspirationRangeRestriction: -1, restrictionType: 'none' },
    size: 'lines',
  });
  const coordinates: Coordinate[] = ['E-1', 'E-2', 'E-3', 'E-4'];
  const { board, unitAt } = createBoardWithFacingRow({ coordinates });
  const state = replaceBoard(createEmptyGameState('standard'), board);

  /** The units standing on the given spaces, in that order. */
  const unitsAt = (spaces: Coordinate[]) =>
    spaces.map((space) => unitAt(space).unit);

  /** Each line offered, as the spaces of its two ends. */
  function endSpaces(lines: readonly LegalLine[]): [Coordinate, Coordinate][] {
    const spaces = lines.map((line): [Coordinate, Coordinate] => [
      line.ends[0].placement.coordinate,
      line.ends[1].placement.coordinate,
    ]);
    return spaces;
  }

  it('offers every stretch of the rank first, and lets the player stop before any', () => {
    // Nothing chosen yet.
    const choice = getLegalLinesToOrder(upToTwoLines, 'black', state, []);

    // A rank of four holds ten stretches: four of one, three of two, two of
    // three, and the whole rank.
    expect(choice.next).toHaveLength(10);
    // Stopping now orders no line, forfeiting both (§4.3.3).
    expect(choice.mayStop).toBe(true);
  });

  it('offers only the lines clear of a line already chosen', () => {
    // Black has chosen E-2 to E-3.
    const choice = getLegalLinesToOrder(upToTwoLines, 'black', state, [
      unitsAt(['E-2', 'E-3']),
    ]);

    // E-1 alone and E-4 alone are left: any longer stretch would take in a
    // unit already ordered, or be drawn through one (§4.3.6).
    expect(endSpaces(choice.next)).toStrictEqual([
      ['E-1', 'E-1'],
      ['E-4', 'E-4'],
    ]);
    expect(choice.mayStop).toBe(true);
  });

  it('offers no line more once the card’s number of lines is reached', () => {
    // Black has chosen two lines, as many as the card allows.
    const choice = getLegalLinesToOrder(upToTwoLines, 'black', state, [
      unitsAt(['E-1']),
      unitsAt(['E-3', 'E-4']),
    ]);

    // Nothing more is open; the player stops here.
    expect(choice).toStrictEqual({ mayStop: true, next: [] });
  });
});
