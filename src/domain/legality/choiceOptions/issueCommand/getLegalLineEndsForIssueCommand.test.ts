import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, createUnitWithPlacement } from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updateBoardState,
} from '@transforms';

import {
  getLegalLineEndsForIssueCommand,
  getLineSegmentFromStart,
} from './getLegalLineEndsForIssueCommand';
import { getLegalLineStartsForIssueCommand } from './getLegalUnitsForIssueCommand';

/**
 * Line starts/ends: start needs commander range; end is any unit on the
 * contiguous segment (including the start — singleton lines).
 */
describe(getLegalLineEndsForIssueCommand, () => {
  const rangedLineCommand = {
    ...tempCommandCards[4].command,
    number: 1,
    restrictions: {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
    size: 'lines' as const,
  };

  it('allows a singleton end equal to a start within commander range', () => {
    const start = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState();
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
    let state = createEmptyGameState();
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
    let state = createEmptyGameState();
    let board = addUnitToBoard(state.boardState, start);
    board = addUnitToBoard(board, farEnd);
    // Commander on E-5: start in range 0; E-6 is distance 1 — use range 0 so end is out of range
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = updateBoardState(state, board);

    const range0Command = {
      ...rangedLineCommand,
      restrictions: {
        inspirationRangeRestriction: 0,
        traitRestrictions: [],
        unitRestrictions: [],
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
    expect(ends).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ unit: start.unit }),
        expect.objectContaining({ unit: farEnd.unit }),
      ]),
    );

    const segment = getLineSegmentFromStart(range0Command, state, start);
    expect(segment.map((u) => u.unit.instanceNumber).toSorted()).toStrictEqual([
      1, 2,
    ]);
  });
});
