import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, createUnitWithPlacement } from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updateBoardState,
} from '@transforms';

import { getLegalUnitsForIssueCommand } from './getLegalUnitsForIssueCommand';

/**
 * GetLegalUnitsForIssueCommand: on-board units matching command restrictions.
 */
describe(getLegalUnitsForIssueCommand, () => {
  const unrestrictedCommand = {
    ...tempCommandCards[0].command,
    number: 1,
    restrictions: {
      inspirationRangeRestriction: -1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
  };

  it('includes friendly units on board when unrestricted', () => {
    const unit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState();
    state = updateBoardState(state, addUnitToBoard(state.boardState, unit));

    expect(
      getLegalUnitsForIssueCommand(unrestrictedCommand, 'black', state),
    ).toStrictEqual([unit]);
  });

  it('excludes units outside inspiration range', () => {
    const near = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 1 },
    });
    const far = createUnitWithPlacement({
      coordinate: 'A-1',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2 },
    });
    const rangedCommand = {
      ...unrestrictedCommand,
      restrictions: {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
    };
    let state = createEmptyGameState();
    let board = addUnitToBoard(state.boardState, near);
    board = addUnitToBoard(board, far);
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = updateBoardState(state, board);

    expect(
      getLegalUnitsForIssueCommand(rangedCommand, 'black', state),
    ).toStrictEqual([near]);
  });

  it('excludes units already commanded', () => {
    const unit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState();
    state = updateBoardState(state, addUnitToBoard(state.boardState, unit));
    state = {
      ...state,
      currentRoundState: {
        ...state.currentRoundState,
        commandedUnits: [unit.unit],
      },
    };

    expect(
      getLegalUnitsForIssueCommand(unrestrictedCommand, 'black', state),
    ).toStrictEqual([]);
  });
});
