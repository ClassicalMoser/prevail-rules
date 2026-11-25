import type { Coordinate } from '@entities';
import {
  coordinatesOfSegment,
  createBoardWithFacingRow,
  createGameState,
  createGameStateWithBoard,
  createGameStateWithEngagedUnits,
  createTestCommand,
  createTestUnit,
} from '@testing';
import { addUnitsToCommandedUnits, deployCommander } from '@transforms';
import { throwIfUndefined } from '@utils';

import { getLegalUnitsForIssueCommand } from './getLegalUnitsForIssueCommand';
import {
  findLegalLine,
  getLegalLines,
  getLineRefusalReason,
  listsWholeLine,
} from './getLegalLines';

/**
 * A lines order is given to one line: an unbroken stretch of one to eight
 * units of a rank, named by its two ends (§4.3.5). Every unit must match the
 * order's traits and types, and at least one, anywhere in the line, must be
 * within inspiration range. The player may take any such stretch, not only
 * the whole rank or the longest one.
 */
describe('getLegalLines function', () => {
  /** A lines order reaching no further than the commander's own space. */
  const atCommanderLineCommand = createTestCommand({
    number: 1,
    restrictions: { inspirationRangeRestriction: 0, restrictionType: 'none' },
    size: 'lines',
  });

  /** A lines order with no inspiration limit, so only the rank decides. */
  const unlimitedLineCommand = createTestCommand({
    number: 1,
    restrictions: { inspirationRangeRestriction: -1, restrictionType: 'none' },
    size: 'lines',
  });

  it('makes a unit within range a line of one', () => {
    // One black unit on E-5, with its commander.
    const state = deployCommander(
      createGameState([['E-5', 'black']]),
      'black',
      'E-5',
    );

    // A line of one names the same unit at both ends.
    const lines = getLegalLines(atCommanderLineCommand, 'black', state);
    expect(lines.map((line) => coordinatesOfSegment(line.ends))).toStrictEqual([
      ['E-5', 'E-5'],
    ]);
  });

  it('offers no line to a unit beyond range that stands alone', () => {
    // One black unit on A-1, far from its commander on E-5.
    const state = deployCommander(
      createGameState([['A-1', 'black']]),
      'black',
      'E-5',
    );

    // No unit of any line through it is within range.
    expect(getLegalLines(atCommanderLineCommand, 'black', state)).toStrictEqual(
      [],
    );
  });

  it('lets a line run beyond range, so long as one of its units is within it', () => {
    // A rank of two, E-5 and E-6, facing north; the commander stands on E-5,
    // so only that unit is within range.
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-5', 'E-6'],
    });
    const state = deployCommander(
      createGameStateWithBoard(board),
      'black',
      'E-5',
    );

    const lines = getLegalLines(atCommanderLineCommand, 'black', state);

    // E-5 alone, or both together. E-6 alone holds no unit within range.
    expect(lines.map((line) => coordinatesOfSegment(line.ends))).toStrictEqual([
      ['E-5', 'E-5'],
      ['E-5', 'E-6'],
    ]);
    expect(
      findLegalLine(lines, [unitAt('E-6').unit, unitAt('E-6').unit]),
    ).toBeUndefined();
  });

  it('counts a unit in the middle of the line as within range, not only an end', () => {
    // A rank of eight, E-1 to E-8, facing north; the commander stands with
    // the fourth unit, on E-4.
    const coordinates: Coordinate[] = [
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
    ];
    const { board, unitAt } = createBoardWithFacingRow({ coordinates });
    const state = deployCommander(
      createGameStateWithBoard(board),
      'black',
      'E-4',
    );

    const lines = getLegalLines(atCommanderLineCommand, 'black', state);

    // The whole rank is a line, named by its ends in either order.
    expect(
      findLegalLine(lines, [unitAt('E-8').unit, unitAt('E-1').unit]),
    ).toBeDefined();
    // Every stretch that takes in E-4 is a line: four places it may begin,
    // and five it may end.
    expect(lines).toHaveLength(20);
    // A stretch that leaves E-4 out has no unit within range.
    expect(
      findLegalLine(lines, [unitAt('E-5').unit, unitAt('E-8').unit]),
    ).toBeUndefined();
  });

  it('offers every stretch of one to eight units, and none longer', () => {
    // A rank of ten, E-1 to E-10, under an order with no range limit.
    const coordinates: Coordinate[] = [
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
      'E-9',
      'E-10',
    ];
    const { board, unitAt } = createBoardWithFacingRow({ coordinates });
    const state = createGameStateWithBoard(board);

    const lines = getLegalLines(unlimitedLineCommand, 'black', state);

    // Ten stretches of one, nine of two, and so on down to three of eight.
    expect(lines).toHaveLength(10 + 9 + 8 + 7 + 6 + 5 + 4 + 3);
    // The player need not take the whole rank: a short stretch in the middle
    // is a line, and so are the middle eight.
    expect(
      findLegalLine(lines, [unitAt('E-3').unit, unitAt('E-5').unit]),
    ).toBeDefined();
    expect(
      findLegalLine(lines, [unitAt('E-2').unit, unitAt('E-9').unit]),
    ).toBeDefined();
    // Nine units is one too many (§4.3.5).
    expect(
      findLegalLine(lines, [unitAt('E-1').unit, unitAt('E-9').unit]),
    ).toBeUndefined();
  });

  it('lists each line by every unit between its ends, in rank order', () => {
    // A rank of three, E-1 to E-3, under an order with no range limit.
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-2', 'E-3'],
    });
    const state = createGameStateWithBoard(board);

    const lines = getLegalLines(unlimitedLineCommand, 'black', state);
    const whole = throwIfUndefined(
      findLegalLine(lines, [unitAt('E-3').unit, unitAt('E-1').unit]),
      'E-1 to E-3 is a line of a rank of three',
    );

    // The line named by its outer ends orders the middle unit too: an order
    // to a line commands every unit of it (§4.3.5).
    expect(coordinatesOfSegment(whole.units)).toStrictEqual([
      'E-1',
      'E-2',
      'E-3',
    ]);
  });

  it('refuses a line whose end has already been commanded this round', () => {
    // A rank of three, E-1 to E-3, under an order with no range limit; the
    // unit on E-1 has had its order this round.
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-2', 'E-3'],
    });
    const commanded = addUnitsToCommandedUnits(
      createGameStateWithBoard(board),
      [unitAt('E-1').unit],
    );

    // One order per unit per round (§4.3.6), so it cannot be a line's end.
    expect(
      findLegalLine(getLegalLines(unlimitedLineCommand, 'black', commanded), [
        unitAt('E-1').unit,
        unitAt('E-3').unit,
      ]),
    ).toBeUndefined();
    expect(
      getLineRefusalReason(unlimitedLineCommand, 'black', commanded, [
        unitAt('E-1').unit,
        unitAt('E-3').unit,
      ]),
    ).toBe('A line end may not stand in a line under this order');
  });

  it('refuses a line whose end is locked in an engagement', () => {
    const ours = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const theirs = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    // Our unit has walked into the enemy: both stand in E-5 (§2.2.1).
    const state = createGameStateWithEngagedUnits(ours, theirs, 'E-5', 'north');

    // An engaged unit cannot be ordered (§4.3.4), so it cannot end a line.
    expect(
      getLineRefusalReason(unlimitedLineCommand, 'black', state, [ours, ours]),
    ).toBe('A line end may not stand in a line under this order');
  });

  it('cuts a rank short at a commanded unit in the middle', () => {
    // A rank of five, E-1 to E-5, with the middle unit already commanded.
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-2', 'E-3', 'E-4', 'E-5'],
    });
    const state = addUnitsToCommandedUnits(createGameStateWithBoard(board), [
      unitAt('E-3').unit,
    ]);

    const lines = getLegalLines(unlimitedLineCommand, 'black', state);

    // A line cannot be drawn through a commanded unit (§4.3.6): two units on
    // either side give three stretches each, and none crosses E-3.
    expect(lines).toHaveLength(6);
    expect(
      findLegalLine(lines, [unitAt('E-2').unit, unitAt('E-4').unit]),
    ).toBeUndefined();
    expect(
      findLegalLine(lines, [unitAt('E-1').unit, unitAt('E-2').unit]),
    ).toBeDefined();
    expect(
      findLegalLine(lines, [unitAt('E-4').unit, unitAt('E-5').unit]),
    ).toBeDefined();
  });

  it('offers as line ends only units that a units order could also name', () => {
    // A rank of four, with the second unit already commanded.
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-2', 'E-3', 'E-4'],
    });
    const state = addUnitsToCommandedUnits(createGameStateWithBoard(board), [
      unitAt('E-2').unit,
    ]);

    const lines = getLegalLines(unlimitedLineCommand, 'black', state);
    const mayBeOrdered = getLegalUnitsForIssueCommand(
      unlimitedLineCommand,
      'black',
      state,
    ).map((member) => member.unit);

    // Both lists answer "who may an order name", so every end of every line
    // is a unit the units order offers too.
    for (const line of lines) {
      for (const end of line.ends) {
        expect(mayBeOrdered).toContainEqual(end.unit);
      }
    }
  });
});

/**
 * A line order lists every unit it commands (§4.3.5), read from either end.
 * A list that skips a unit between the ends, or runs past them, is not the
 * line its ends name.
 */
describe('listsWholeLine function', () => {
  const unlimitedLineCommand = createTestCommand({
    number: 1,
    restrictions: { inspirationRangeRestriction: -1, restrictionType: 'none' },
    size: 'lines',
  });

  // Black has a rank of four, E-1 to E-4, facing north. The line under test
  // is E-1 to E-3, as getLegalLines offers it.
  const { board, unitAt } = createBoardWithFacingRow({
    coordinates: ['E-1', 'E-2', 'E-3', 'E-4'],
  });
  const state = createGameStateWithBoard(board);
  const line = throwIfUndefined(
    findLegalLine(getLegalLines(unlimitedLineCommand, 'black', state), [
      unitAt('E-1').unit,
      unitAt('E-3').unit,
    ]),
    'E-1 to E-3 is a line of a rank of four',
  );

  /** The units standing on the given spaces, in that order. */
  const unitsAt = (spaces: Coordinate[]) =>
    spaces.map((space) => unitAt(space).unit);

  it('accepts the line listed in rank order', () => {
    expect(listsWholeLine(line, unitsAt(['E-1', 'E-2', 'E-3']))).toBe(true);
  });

  it('accepts the line listed from its other end', () => {
    // A line is named from either end, so its units may be read either way.
    expect(listsWholeLine(line, unitsAt(['E-3', 'E-2', 'E-1']))).toBe(true);
  });

  it('refuses a list that skips a unit between the ends', () => {
    // E-2 stands between the ends, so the order commands it too.
    expect(listsWholeLine(line, unitsAt(['E-1', 'E-3']))).toBe(false);
  });

  it('refuses a list that runs past an end', () => {
    // E-4 stands beyond E-3, outside the line these ends name.
    expect(listsWholeLine(line, unitsAt(['E-1', 'E-2', 'E-3', 'E-4']))).toBe(
      false,
    );
  });

  it('refuses a list of the right length out of rank order', () => {
    // Every unit of the line is there, but the middle is not in the middle.
    expect(listsWholeLine(line, unitsAt(['E-2', 'E-1', 'E-3']))).toBe(false);
  });
});

/**
 * When the ends a player names give no legal line, the refusal says which
 * rule of §4.3.5 they break, checked in the order a player would: are the
 * ends units this order may name, do they share an unbroken rank, is it short
 * enough, and is any of it within reach of the commander.
 */
describe('getLineRefusalReason function', () => {
  /** A lines order reaching no further than the commander's own space. */
  const atCommanderLineCommand = createTestCommand({
    number: 1,
    restrictions: { inspirationRangeRestriction: 0, restrictionType: 'none' },
    size: 'lines',
  });

  /** A lines order with no inspiration limit, so only the rank decides. */
  const unlimitedLineCommand = createTestCommand({
    number: 1,
    restrictions: { inspirationRangeRestriction: -1, restrictionType: 'none' },
    size: 'lines',
  });

  it('refuses an end that is not on the board', () => {
    // Black has one unit on E-1; a second black unit has never been placed.
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-1'],
    });
    const state = createGameStateWithBoard(board);
    const offBoard = createTestUnit('black', { attack: 3, instanceNumber: 2 });

    // Only a unit on the board can be ordered.
    expect(
      getLineRefusalReason(unlimitedLineCommand, 'black', state, [
        unitAt('E-1').unit,
        offBoard,
      ]),
    ).toBe('A line end is not on the board for black');
  });

  it('refuses an end that belongs to the enemy', () => {
    // Black on E-1 stands beside a white unit on E-2.
    const state = createGameState([
      ['E-1', 'black'],
      ['E-2', 'white'],
    ]);
    const ours = createTestUnit('black', { instanceNumber: 1 });
    const theirs = createTestUnit('white', { instanceNumber: 1 });

    // A line is a rank of the player's own units (§4.3.5).
    expect(
      getLineRefusalReason(unlimitedLineCommand, 'black', state, [
        ours,
        theirs,
      ]),
    ).toBe('A line end may not stand in a line under this order');
  });

  it('refuses ends with a gap between them', () => {
    // Black on E-1 and E-3, with E-2 empty.
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-3'],
    });
    const state = createGameStateWithBoard(board);

    // A line is unbroken: no gap in the middle (§4.3.5).
    expect(
      getLineRefusalReason(unlimitedLineCommand, 'black', state, [
        unitAt('E-1').unit,
        unitAt('E-3').unit,
      ]),
    ).toBe('The two ends do not stand on one unbroken rank');
  });

  it('refuses ends nine units apart', () => {
    // A rank of nine, E-1 to E-9, under an order with no range limit.
    const coordinates: Coordinate[] = [
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
      'E-9',
    ];
    const { board, unitAt } = createBoardWithFacingRow({ coordinates });
    const state = createGameStateWithBoard(board);

    // A line is at most eight units (§4.3.5); these ends take in nine.
    expect(
      getLineRefusalReason(unlimitedLineCommand, 'black', state, [
        unitAt('E-9').unit,
        unitAt('E-1').unit,
      ]),
    ).toBe('A line is at most 8 units; these ends span 9');
  });

  it('names the inspiration range when the ends are a whole line of eight beyond the commander’s reach', () => {
    // A rank of eight, E-1 to E-8, with the commander far off on A-1.
    const coordinates: Coordinate[] = [
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
    ];
    const { board, unitAt } = createBoardWithFacingRow({ coordinates });
    const state = deployCommander(
      createGameStateWithBoard(board),
      'black',
      'A-1',
    );

    // Eight is a whole line, so the length is not what is wrong: no unit of
    // it stands with the commander (§4.3.5).
    expect(
      getLineRefusalReason(atCommanderLineCommand, 'black', state, [
        unitAt('E-1').unit,
        unitAt('E-8').unit,
      ]),
    ).toBe('No unit of the line is within inspiration range');
  });
});
