import type { IssueCommandEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { isValidIssueCommandEvent } from './isValidIssueCommandEvent';

/**
 * IsValidIssueCommandEvent: remaining command + restriction integrity.
 */
describe(isValidIssueCommandEvent, () => {
  function stateReadyToIssue(command = tempCommandCards[0].command) {
    const unit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: tempCommandCards[0] },
    });
    let board = addUnitToBoard(state.boardState, unit);
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = updateBoardState(state, board);
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        remainingCommandsFirstPlayer: [command],
        step: 'firstPlayerIssueCommands',
      }),
    );
    return { state, unit };
  }

  it('accepts issuing the remaining unit-sized command with one eligible unit', () => {
    const command = {
      ...tempCommandCards[0].command,
      number: 1,
      restrictions: {
        inspirationRangeRestriction: -1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'units' as const,
    };
    const { state, unit } = stateReadyToIssue(command);
    const event: IssueCommandEvent = {
      choiceType: 'issueCommand',
      command,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      units: [unit.unit],
    };

    expect(isValidIssueCommandEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects wrong unit count for size units', () => {
    const command = {
      ...tempCommandCards[0].command,
      number: 1,
      restrictions: {
        inspirationRangeRestriction: -1,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'units' as const,
    };
    const { state, unit } = stateReadyToIssue(command);
    const other = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2 },
    });
    const withSecond = updateBoardState(
      state,
      addUnitToBoard(state.boardState, other),
    );
    const event: IssueCommandEvent = {
      choiceType: 'issueCommand',
      command,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      units: [unit.unit, other.unit],
    };

    expect(isValidIssueCommandEvent(event, withSecond).result).toBe(false);
  });

  it('rejects a unit outside inspiration range', () => {
    const command = {
      ...tempCommandCards[0].command,
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 0,
        traitRestrictions: [],
        unitRestrictions: [],
      },
      size: 'units' as const,
    };
    const far = createUnitWithPlacement({
      coordinate: 'A-1',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    let board = addUnitToBoard(state.boardState, far);
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = updateBoardState(state, board);
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        remainingCommandsFirstPlayer: [command],
        step: 'firstPlayerIssueCommands',
      }),
    );
    const event: IssueCommandEvent = {
      choiceType: 'issueCommand',
      command,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      units: [far.unit],
    };

    expect(isValidIssueCommandEvent(event, state).result).toBe(false);
  });

  it('rejects when issue command is not expected', () => {
    const command = tempCommandCards[0].command;
    const unit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event: IssueCommandEvent = {
      choiceType: 'issueCommand',
      command,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      units: [unit.unit],
    };

    expect(isValidIssueCommandEvent(event, state).result).toBe(false);
  });
});
