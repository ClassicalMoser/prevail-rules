import type { Coordinate } from '@entities';
import type { LegalLine } from './getLegalLines';
import {
  createBoardWithFacingRow,
  createTestCommand,
  createUnitWithPlacement,
} from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updateBoardState,
} from '@transforms';

import { findLegalLine, getLegalLines } from './getLegalLines';

import { createEmptyGameState } from '@factories';

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

  /** Each line as the spaces of its two ends. */
  function endSpaces(lines: readonly LegalLine[]): [Coordinate, Coordinate][] {
    const spaces = lines.map((line): [Coordinate, Coordinate] => [
      line.ends[0].placement.coordinate,
      line.ends[1].placement.coordinate,
    ]);
    return spaces;
  }

  it('makes a unit within range a line of one', () => {
    // One black unit on E-5, with its commander.
    const unit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let board = addUnitToBoard(
      createEmptyGameState('standard').boardState,
      unit,
    );
    board = addCommanderToBoard(board, 'black', 'E-5');
    const state = updateBoardState(createEmptyGameState('standard'), board);

    // A line of one names the same unit at both ends.
    expect(
      endSpaces(getLegalLines(atCommanderLineCommand, 'black', state)),
    ).toStrictEqual([['E-5', 'E-5']]);
  });

  it('offers no line to a unit beyond range that stands alone', () => {
    // One black unit on A-1, far from its commander on E-5.
    const unit = createUnitWithPlacement({
      coordinate: 'A-1',
      facing: 'north',
      playerSide: 'black',
    });
    let board = addUnitToBoard(
      createEmptyGameState('standard').boardState,
      unit,
    );
    board = addCommanderToBoard(board, 'black', 'E-5');
    const state = updateBoardState(createEmptyGameState('standard'), board);

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
    const state = updateBoardState(
      createEmptyGameState('standard'),
      addCommanderToBoard(board, 'black', 'E-5'),
    );

    const lines = getLegalLines(atCommanderLineCommand, 'black', state);

    // E-5 alone, or both together. E-6 alone holds no unit within range.
    expect(endSpaces(lines)).toStrictEqual([
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
    const state = updateBoardState(
      createEmptyGameState('standard'),
      addCommanderToBoard(board, 'black', 'E-4'),
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
    const state = updateBoardState(createEmptyGameState('standard'), board);

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
});
