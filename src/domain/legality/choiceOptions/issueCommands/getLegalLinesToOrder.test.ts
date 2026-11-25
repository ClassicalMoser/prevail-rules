import type { Coordinate } from '@ruleValues';
import {
  coordinatesOfSegment,
  createBoardWithFacingRow,
  createGameStateWithBoard,
  createTestCommand,
} from '@testing';

import {
  getLegalLinesToOrder,
  getLinesOrderRefusalReason,
} from './getLegalLinesToOrder';

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
  const state = createGameStateWithBoard(board);

  /** The units standing on the given spaces, in that order. */
  const unitsAt = (spaces: Coordinate[]) =>
    spaces.map((space) => unitAt(space).unit);

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
    expect(
      choice.next.map((line) => coordinatesOfSegment(line.ends)),
    ).toStrictEqual([
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

/**
 * When a submitted lines order names a line that was not offered, the
 * refusal says which rule it breaks (§4.3.3–4.3.6): too many lines, an empty
 * line, a unit ordered twice, ends that name no legal line, or a list that is
 * not the whole line between its ends.
 *
 * Black has a rank of four, E-1 to E-4, facing north, and a command for up
 * to two lines with no range limit.
 */
describe('getLinesOrderRefusalReason function', () => {
  const upToTwoLines = createTestCommand({
    number: 2,
    restrictions: { inspirationRangeRestriction: -1, restrictionType: 'none' },
    size: 'lines',
  });
  const coordinates: Coordinate[] = ['E-1', 'E-2', 'E-3', 'E-4'];
  const { board, unitAt } = createBoardWithFacingRow({ coordinates });
  const state = createGameStateWithBoard(board);

  /** The units standing on the given spaces, in that order. */
  const unitsAt = (spaces: Coordinate[]) =>
    spaces.map((space) => unitAt(space).unit);

  it('refuses a line past the card’s number of lines', () => {
    // Three lines of one under a command for two.
    const submitted = [unitsAt(['E-1']), unitsAt(['E-2']), unitsAt(['E-3'])];

    // The printed number is a ceiling (§4.3.3).
    expect(
      getLinesOrderRefusalReason(upToTwoLines, 'black', state, submitted, 2),
    ).toBe('Expected at most 2 lines, got 3');
  });

  it('refuses a line that lists no unit', () => {
    // A line of one is the shortest there is (§4.3.5).
    expect(
      getLinesOrderRefusalReason(upToTwoLines, 'black', state, [[]], 0),
    ).toBe('A line lists at least one unit');
  });

  it('refuses a line that takes in a unit the line before it already orders', () => {
    // E-1 to E-2, then E-2 to E-3: E-2 is in both.
    const submitted = [unitsAt(['E-1', 'E-2']), unitsAt(['E-2', 'E-3'])];

    // A unit is ordered once a round (§4.3.6).
    expect(
      getLinesOrderRefusalReason(upToTwoLines, 'black', state, submitted, 1),
    ).toBe('A line takes in a unit already ordered by another line');
  });

  it('gives the line’s own rule when its ends name no legal line', () => {
    // Black's units stand on E-1 and E-3, with E-2 empty between them, and
    // the player names those two as a line.
    const gapped = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-3'],
    });
    const gappedState = createGameStateWithBoard(gapped.board);
    const submitted = [[gapped.unitAt('E-1').unit, gapped.unitAt('E-3').unit]];

    // An empty E-2 breaks the rank, so these ends name no line (§4.3.5).
    expect(
      getLinesOrderRefusalReason(
        upToTwoLines,
        'black',
        gappedState,
        submitted,
        0,
      ),
    ).toBe('The two ends do not stand on one unbroken rank');
  });

  it('refuses a list that skips a unit between its ends', () => {
    // E-1 and E-3 name the line E-1 to E-3, which commands E-2 as well.
    const submitted = [unitsAt(['E-1', 'E-3'])];

    // An order to a line commands every unit of it (§4.3.5).
    expect(
      getLinesOrderRefusalReason(upToTwoLines, 'black', state, submitted, 0),
    ).toBe(
      'The units listed are not every unit of the line between its ends, in rank order',
    );
  });

  it('throws when asked about a position with no line', () => {
    // One line submitted; there is nothing at the second position to refuse.
    expect(() =>
      getLinesOrderRefusalReason(
        upToTwoLines,
        'black',
        state,
        [unitsAt(['E-1'])],
        1,
      ),
    ).toThrow('No line at position 1');
  });

  it('throws when asked about a line that was offered', () => {
    // E-3 to E-1, the whole line read from its other end, is a legal order.
    const submitted = [unitsAt(['E-3', 'E-2', 'E-1'])];

    // There is no refusal to word, so the caller asked out of turn.
    expect(() =>
      getLinesOrderRefusalReason(upToTwoLines, 'black', state, submitted, 0),
    ).toThrow('The line was offered, so it has no refusal reason');
  });
});
