import { tempCommandCards } from '@sampleValues';
import { PLAY_CARDS_PHASE } from '@game';
import {
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

import { createEmptyGameState, createIssueCommandEvent } from '@factories';
/**
 * IsValidIssueCommandEvent: remaining command + restriction integrity.
 */
describe('isValidIssueCommandEvent function', () => {
  function stateReadyToIssue(command = tempCommandCards[0].command) {
    const unit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState('standard');
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
        restrictionType: 'none' as const,
      },
      size: 'units' as const,
    };
    const { state, unit } = stateReadyToIssue(command);
    const event = createIssueCommandEvent({
      command,
      player: 'black',
      units: [unit.unit],
    });

    expect(isValidIssueCommandEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts under-filling a units grant when at least one unit is selected', () => {
    const command = {
      ...tempCommandCards[0].command,
      number: 2,
      restrictions: {
        inspirationRangeRestriction: -1,
        restrictionType: 'none' as const,
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
    const event = createIssueCommandEvent({
      command,
      player: 'black',
      units: [unit.unit],
    });

    expect(isValidIssueCommandEvent(event, withSecond)).toStrictEqual({
      result: true,
    });
  });

  it('rejects over-filling a units grant past command.number', () => {
    const command = {
      ...tempCommandCards[0].command,
      number: 1,
      restrictions: {
        inspirationRangeRestriction: -1,
        restrictionType: 'none' as const,
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
    const event = createIssueCommandEvent({
      command,
      player: 'black',
      units: [unit.unit, other.unit],
    });

    expect(isValidIssueCommandEvent(event, withSecond)).toStrictEqual({
      errorReason: 'Expected 1..1 units, got 2',
      result: false,
    });
  });

  it('rejects an empty units selection', () => {
    const command = {
      ...tempCommandCards[0].command,
      number: 6,
      restrictions: {
        inspirationRangeRestriction: -1,
        restrictionType: 'none' as const,
      },
      size: 'units' as const,
    };
    const { state } = stateReadyToIssue(command);
    const event = createIssueCommandEvent({
      command,
      player: 'black',
      units: [],
    });

    expect(isValidIssueCommandEvent(event, state)).toStrictEqual({
      errorReason: 'Expected 1..6 units, got 0',
      result: false,
    });
  });

  it('rejects a unit outside inspiration range', () => {
    const command = {
      ...tempCommandCards[0].command,
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 0,
        restrictionType: 'none' as const,
      },
      size: 'units' as const,
    };
    const far = createUnitWithPlacement({
      coordinate: 'A-1',
      facing: 'north',
      playerSide: 'black',
    });
    let state = createEmptyGameState('standard');
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
    const event = createIssueCommandEvent({
      command,
      player: 'black',
      units: [far.unit],
    });

    expect(isValidIssueCommandEvent(event, state).result).toBe(false);
  });

  it('throws when asked outside the issue commands phase, which the expected check rules out first', () => {
    const command = tempCommandCards[0].command;
    const unit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createIssueCommandEvent({
      command,
      player: 'black',
      units: [unit.unit],
    });

    // An order given while the cards are being chosen is refused by the
    // expected check before membership is asked; reaching here is a fault.
    expect(() => isValidIssueCommandEvent(event, state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });
});
