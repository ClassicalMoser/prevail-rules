import { tempCommandCards } from '@sampleValues';
import { PLAY_CARDS_PHASE } from '@game';
import type { Coordinate } from '@entities';
import {
  createBoardWithFacingRow,
  createIssueCommandsPhaseState,
  createTestCommand,
  createUnitWithPlacement,
  replaceBoard,
  updateCardState,
} from '@testing';

import {
  addCommanderToBoard,
  addUnitToBoard,
  updatePhaseState,
  updateCurrentInitiative,
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
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: tempCommandCards[0] },
    });
    let board = addUnitToBoard(state.boardState, unit);
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = replaceBoard(state, board);
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
      player: 'black',
      order: {
        command,
        selection: { selectionType: 'units', units: [unit.unit] },
      },
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
    const withSecond = replaceBoard(
      state,
      addUnitToBoard(state.boardState, other),
    );
    const event = createIssueCommandEvent({
      player: 'black',
      order: {
        command,
        selection: { selectionType: 'units', units: [unit.unit] },
      },
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
    const withSecond = replaceBoard(
      state,
      addUnitToBoard(state.boardState, other),
    );
    const event = createIssueCommandEvent({
      player: 'black',
      order: {
        command,
        selection: { selectionType: 'units', units: [unit.unit, other.unit] },
      },
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
      player: 'black',
      order: {
        command,
        selection: { selectionType: 'units', units: [] },
      },
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
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    let board = addUnitToBoard(state.boardState, far);
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = replaceBoard(state, board);
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        remainingCommandsFirstPlayer: [command],
        step: 'firstPlayerIssueCommands',
      }),
    );
    const event = createIssueCommandEvent({
      player: 'black',
      order: {
        command,
        selection: { selectionType: 'units', units: [far.unit] },
      },
    });

    expect(isValidIssueCommandEvent(event, state).result).toBe(false);
  });

  /**
   * Black's rank of eight, E-1 to E-8, facing north, with one lines order
   * left that reaches no further than the commander's own space. The
   * commander stands with the fourth unit, on E-4, so that unit alone is
   * within range.
   */
  function stateWithRankOfEight() {
    const command = createTestCommand({
      number: 1,
      restrictions: {
        inspirationRangeRestriction: 0,
        restrictionType: 'none',
      },
      size: 'lines',
    });
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
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: tempCommandCards[0] },
    });
    state = replaceBoard(state, addCommanderToBoard(board, 'black', 'E-4'));
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        remainingCommandsFirstPlayer: [command],
        step: 'firstPlayerIssueCommands',
      }),
    );
    // The units standing on the given spaces, in that order.
    const unitsAt = (spaces: Coordinate[]) =>
      spaces.map((space) => unitAt(space).unit);
    return { command, state, unitsAt };
  }

  it('accepts a line whose only unit within inspiration range stands in its middle', () => {
    const { command, state, unitsAt } = stateWithRankOfEight();

    // Black orders the whole rank, listing every unit in rank order. Range
    // is traced from any unit in the line, not only from an end (§4.3.5).
    const event = createIssueCommandEvent({
      player: 'black',
      order: {
        command,
        selection: {
          selectionType: 'line',
          units: unitsAt([
            'E-1',
            'E-2',
            'E-3',
            'E-4',
            'E-5',
            'E-6',
            'E-7',
            'E-8',
          ]),
        },
      },
    });

    expect(isValidIssueCommandEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts a line listed from either end', () => {
    const { command, state, unitsAt } = stateWithRankOfEight();

    // Black lists the stretch E-4 to E-2 from its far end; a line is the
    // same line read either way (§4.3.5).
    const event = createIssueCommandEvent({
      player: 'black',
      order: {
        command,
        selection: {
          selectionType: 'line',
          units: unitsAt(['E-4', 'E-3', 'E-2']),
        },
      },
    });

    expect(isValidIssueCommandEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a line that leaves out a unit between its ends', () => {
    const { command, state, unitsAt } = stateWithRankOfEight();

    // Black names E-2 and E-4 as the line but leaves out E-3, between them.
    // Every unit of the line is ordered, so the list must hold them all.
    const event = createIssueCommandEvent({
      player: 'black',
      order: {
        command,
        selection: {
          selectionType: 'line',
          units: unitsAt(['E-2', 'E-4']),
        },
      },
    });

    // The ends name a legal line, but the list is not that line's units.
    expect(isValidIssueCommandEvent(event, state)).toStrictEqual({
      errorReason:
        'The units listed are not every unit of the line between its ends, in rank order',
      result: false,
    });
  });

  it('rejects a line that lists no units', () => {
    const { command, state } = stateWithRankOfEight();

    // A line holds one to eight units (§4.3.5); an empty list is no line.
    const event = createIssueCommandEvent({
      player: 'black',
      order: {
        command,
        selection: { selectionType: 'line', units: [] },
      },
    });

    expect(isValidIssueCommandEvent(event, state)).toStrictEqual({
      errorReason: 'A line order lists at least one unit',
      result: false,
    });
  });

  it('accepts stopping, with no order, from the player who is issuing', () => {
    // Black is issuing with an order left.
    const { state } = stateReadyToIssue();

    // Stopping is always legal while orders are left (§4.3.3).
    expect(
      isValidIssueCommandEvent(
        createIssueCommandEvent({ order: 'none', player: 'black' }),
        state,
      ),
    ).toStrictEqual({ result: true });
  });

  it('rejects stopping from the player who is not issuing', () => {
    // Black is issuing, so White has no orders to stop giving.
    const { state } = stateReadyToIssue();

    // The refusal names who is issuing.
    expect(
      isValidIssueCommandEvent(
        createIssueCommandEvent({ order: 'none', player: 'white' }),
        state,
      ),
    ).toStrictEqual({
      errorReason: 'Expected issue command from black, got white',
      result: false,
    });
  });

  it('throws when asked outside the issue commands phase, which the expected check rules out first', () => {
    const command = tempCommandCards[0].command;
    const unit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      },
    );
    const event = createIssueCommandEvent({
      player: 'black',
      order: {
        command,
        selection: { selectionType: 'units', units: [unit.unit] },
      },
    });

    // An order given while the cards are being chosen is refused by the
    // expected check before membership is asked; reaching here is a fault.
    expect(() => isValidIssueCommandEvent(event, state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });
});
