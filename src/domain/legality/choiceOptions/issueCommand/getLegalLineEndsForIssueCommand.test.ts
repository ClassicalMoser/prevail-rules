import type { Coordinate } from '@entities';
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

import { getLegalLineEndsForIssueCommand } from './getLegalLineEndsForIssueCommand';
import { getLegalLineStartsForIssueCommand } from './getLegalUnitsForIssueCommand';

import { createEmptyGameState } from '@factories';
/**
 * Line starts/ends: start needs commander range; end is any unit on the
 * contiguous segment (including the start — singleton lines).
 */
describe('getLegalLineEndsForIssueCommand function', () => {
  // A lines movement order with inspiration range 1.
  const rangedLineCommand = createTestCommand({
    number: 1,
    restrictions: {
      inspirationRangeRestriction: 1,
      restrictionType: 'none',
    },
    size: 'lines',
  });

  it('allows a singleton end equal to a start within commander range', () => {
    const start = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState('standard');
    let board = addUnitToBoard(state.boardState, start);
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = updateBoardState(state, board);

    expect(
      getLegalLineStartsForIssueCommand(rangedLineCommand, 'black', state),
    ).toStrictEqual([start]);
    expect(
      getLegalLineEndsForIssueCommand(rangedLineCommand, 'black', state, start),
    ).toStrictEqual([start]);
  });

  it('rejects a start outside commander range', () => {
    const start = createUnitWithPlacement({
      coordinate: 'A-1',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState('standard');
    let board = addUnitToBoard(state.boardState, start);
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = updateBoardState(state, board);

    expect(
      getLegalLineStartsForIssueCommand(rangedLineCommand, 'black', state),
    ).toStrictEqual([]);
    expect(
      getLegalLineEndsForIssueCommand(rangedLineCommand, 'black', state, start),
    ).toStrictEqual([]);
  });

  it('allows an end outside inspiration range when the start is in range', () => {
    const start = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 1 },
    });
    // Facing north → flanks are west/east → E-4 / E-6
    const farEnd = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2 },
    });
    let state = createEmptyGameState('standard');
    let board = addUnitToBoard(state.boardState, start);
    board = addUnitToBoard(board, farEnd);
    // Commander on E-5: start in range 0; E-6 is distance 1 — use range 0 so end is out of range
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = updateBoardState(state, board);

    const range0Command = {
      ...rangedLineCommand,
      restrictions: {
        inspirationRangeRestriction: 0,
        restrictionType: 'none' as const,
      },
    };

    const starts = getLegalLineStartsForIssueCommand(
      range0Command,
      'black',
      state,
    );
    expect(starts).toStrictEqual([start]);

    const ends = getLegalLineEndsForIssueCommand(
      range0Command,
      'black',
      state,
      start,
    );
    expect(ends).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({ unit: start.unit }),
        expect.objectContaining({ unit: farEnd.unit }),
      ]),
    );
  });

  // An order with no inspiration limit, so only the rank decides the ends.
  const unlimitedLineCommand = createTestCommand({
    number: 1,
    restrictions: {
      inspirationRangeRestriction: -1,
      restrictionType: 'none',
    },
    size: 'lines',
  });

  it('offers every unit within seven places of a start in the middle of a long rank', () => {
    // A rank of eighteen friendly units facing north, E-1 to E-18 (instances 1 to 18).
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
      'E-11',
      'E-12',
      'E-13',
      'E-14',
      'E-15',
      'E-16',
      'E-17',
      'E-18',
    ];
    const { board, unitAt } = createBoardWithFacingRow({ coordinates });
    const state = updateBoardState(createEmptyGameState('standard'), board);

    // A line is one to eight units (§4.3.5), so from E-9 the far end can lie
    // at most seven places away, either side (A7).
    const ends = getLegalLineEndsForIssueCommand(
      unlimitedLineCommand,
      'black',
      state,
      unitAt('E-9'),
    );

    expect(ends.map((end) => end.placement.coordinate)).toStrictEqual([
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
      'E-9',
      'E-10',
      'E-11',
      'E-12',
      'E-13',
      'E-14',
      'E-15',
      'E-16',
    ]);
    expect(ends.map((end) => end.unit.instanceNumber)).toStrictEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
  });

  it('offers seven places one way only from a start at the end of a rank', () => {
    // A rank of ten friendly units facing north, E-1 to E-10 (instances 1 to 10).
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

    // From E-1 nothing lies to the west, and the line may not exceed eight
    // units, so E-9 and E-10 are out of reach (§4.3.5, A7).
    const ends = getLegalLineEndsForIssueCommand(
      unlimitedLineCommand,
      'black',
      state,
      unitAt('E-1'),
    );

    expect(ends.map((end) => end.placement.coordinate)).toStrictEqual([
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
    ]);
  });

  it('the middle eight of a ten-unit rank is a line, leaving one at each end', () => {
    // A rank of ten friendly units facing north, E-1 to E-10. If the rank is
    // longer than eight, the player chooses which eight (§4.3.5, A7): named
    // from E-2, the line may run to E-9, leaving E-1 and E-10 out.
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

    const ends = getLegalLineEndsForIssueCommand(
      unlimitedLineCommand,
      'black',
      state,
      unitAt('E-2'),
    );

    // E-1 is one place west; E-9 is seven places east, the eighth unit; E-10
    // would make nine.
    expect(ends.map((end) => end.placement.coordinate)).toStrictEqual([
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
      'E-6',
      'E-7',
      'E-8',
      'E-9',
    ]);
  });
});
