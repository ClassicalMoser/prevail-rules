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

import { isValidIssueCommandsEvent } from './isValidIssueCommandsEvent';

import { createEmptyGameState, createIssueCommandsEvent } from '@factories';
/**
 * IsValidIssueCommandsEvent: an allocation of the card in play's command,
 * checked a unit or a line at a time against what the rules offer.
 */
describe('isValidIssueCommandsEvent function', () => {
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
    // Black's card in play gives the command under test.
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: { ...tempCommandCards[0], command },
      },
    });
    let board = addUnitToBoard(state.boardState, unit);
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = replaceBoard(state, board);
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
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
    const event = createIssueCommandsEvent({
      player: 'black',
      allocation: { allocationType: 'units', units: [unit.unit] },
    });

    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
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
    const event = createIssueCommandsEvent({
      player: 'black',
      allocation: { allocationType: 'units', units: [unit.unit] },
    });

    expect(isValidIssueCommandsEvent(event, withSecond)).toStrictEqual({
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
    const event = createIssueCommandsEvent({
      player: 'black',
      allocation: { allocationType: 'units', units: [unit.unit, other.unit] },
    });

    expect(isValidIssueCommandsEvent(event, withSecond)).toStrictEqual({
      errorReason: 'Expected at most 1 units, got 2',
      result: false,
    });
  });

  it('accepts ordering no unit at all, which declines the order', () => {
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
    const event = createIssueCommandsEvent({
      player: 'black',
      allocation: { allocationType: 'units', units: [] },
    });

    // A player may decline to order at all (§4.3.2).
    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      result: true,
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
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: { ...tempCommandCards[0], command },
      },
    });
    let board = addUnitToBoard(state.boardState, far);
    board = addCommanderToBoard(board, 'black', 'E-5');
    state = replaceBoard(state, board);
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        step: 'firstPlayerIssueCommands',
      }),
    );
    const event = createIssueCommandsEvent({
      player: 'black',
      allocation: { allocationType: 'units', units: [far.unit] },
    });

    expect(isValidIssueCommandsEvent(event, state).result).toBe(false);
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
    // Black's card in play gives that lines command.
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: { ...tempCommandCards[0], command },
      },
    });
    state = replaceBoard(state, addCommanderToBoard(board, 'black', 'E-4'));
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        step: 'firstPlayerIssueCommands',
      }),
    );
    // The units standing on the given spaces, in that order.
    const unitsAt = (spaces: Coordinate[]) =>
      spaces.map((space) => unitAt(space).unit);
    return { command, state, unitsAt };
  }

  it('accepts a line whose only unit within inspiration range stands in its middle', () => {
    const { state, unitsAt } = stateWithRankOfEight();

    // Black orders the whole rank, listing every unit in rank order. Range
    // is traced from any unit in the line, not only from an end (§4.3.5).
    const event = createIssueCommandsEvent({
      player: 'black',
      allocation: {
        allocationType: 'lines',
        lines: [
          unitsAt(['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8']),
        ],
      },
    });

    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts a line listed from either end', () => {
    const { state, unitsAt } = stateWithRankOfEight();

    // Black lists the stretch E-4 to E-2 from its far end; a line is the
    // same line read either way (§4.3.5).
    const event = createIssueCommandsEvent({
      player: 'black',
      allocation: {
        allocationType: 'lines',
        lines: [unitsAt(['E-4', 'E-3', 'E-2'])],
      },
    });

    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a line that leaves out a unit between its ends', () => {
    const { state, unitsAt } = stateWithRankOfEight();

    // Black names E-2 and E-4 as the line but leaves out E-3, between them.
    // Every unit of the line is ordered, so the list must hold them all.
    const event = createIssueCommandsEvent({
      player: 'black',
      allocation: { allocationType: 'lines', lines: [unitsAt(['E-2', 'E-4'])] },
    });

    // The ends name a legal line, but the list is not that line's units.
    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      errorReason:
        'The units listed are not every unit of the line between its ends, in rank order',
      result: false,
    });
  });

  it('rejects a line that lists no units', () => {
    const { state } = stateWithRankOfEight();

    // A line holds one to eight units (§4.3.5); an empty list is no line.
    const event = createIssueCommandsEvent({
      allocation: { allocationType: 'lines', lines: [[]] },
      player: 'black',
    });

    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      errorReason: 'A line lists at least one unit',
      result: false,
    });
  });

  it('accepts ordering no line at all, forfeiting the order', () => {
    const { state } = stateWithRankOfEight();

    // Black gives none of its lines; the rest is forfeited (§4.3.3).
    const event = createIssueCommandsEvent({
      allocation: { allocationType: 'lines', lines: [] },
      player: 'black',
    });

    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  /**
   * The rank of eight, with a card in play allowing two lines and reaching
   * any distance from the commander, so any stretch of it may be a line.
   */
  function stateWithTwoLinesOnRankOfEight() {
    const { state, unitsAt } = stateWithRankOfEight();
    const card = state.cardState.black.inPlay;
    if (card === null) {
      throw new Error('Black has a card in play');
    }
    const twoLines = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: {
          ...card,
          command: {
            ...card.command,
            number: 2,
            restrictions: {
              inspirationRangeRestriction: -1,
              restrictionType: 'none',
            },
          },
        },
      },
    });
    return { state: twoLines, unitsAt };
  }

  it('accepts two lines that share no unit', () => {
    const { state, unitsAt } = stateWithTwoLinesOnRankOfEight();

    // Black splits its rank in two: E-1 to E-3, and E-5 to E-8 listed from
    // its far end. E-4 is left out of both.
    const event = createIssueCommandsEvent({
      allocation: {
        allocationType: 'lines',
        lines: [
          unitsAt(['E-1', 'E-2', 'E-3']),
          unitsAt(['E-8', 'E-7', 'E-6', 'E-5']),
        ],
      },
      player: 'black',
    });

    // Each line was offered given the one before it (§4.3.3, §4.3.6).
    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a second line that takes in a unit the first already orders', () => {
    const { state, unitsAt } = stateWithTwoLinesOnRankOfEight();

    // Black orders E-2 to E-4, then E-4 to E-6: E-4 would be ordered twice
    // (§4.3.6).
    const event = createIssueCommandsEvent({
      allocation: {
        allocationType: 'lines',
        lines: [unitsAt(['E-2', 'E-3', 'E-4']), unitsAt(['E-4', 'E-5', 'E-6'])],
      },
      player: 'black',
    });

    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      errorReason: 'A line takes in a unit already ordered by another line',
      result: false,
    });
  });

  it('rejects more lines than the card allows', () => {
    const { state, unitsAt } = stateWithRankOfEight();

    // The card allows one line; Black names two.
    const event = createIssueCommandsEvent({
      allocation: {
        allocationType: 'lines',
        lines: [unitsAt(['E-4']), unitsAt(['E-5'])],
      },
      player: 'black',
    });

    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      errorReason: 'Expected at most 1 lines, got 2',
      result: false,
    });
  });

  it('rejects an allocation of the wrong kind for the card’s command', () => {
    const { state, unitsAt } = stateWithRankOfEight();

    // The card gives a lines command; Black names units instead.
    const event = createIssueCommandsEvent({
      allocation: { allocationType: 'units', units: unitsAt(['E-4']) },
      player: 'black',
    });

    // A lines command is spent on lines (§4.3.1).
    expect(isValidIssueCommandsEvent(event, state)).toStrictEqual({
      errorReason: 'The card in play gives a lines command, not units',
      result: false,
    });
  });

  it('rejects an allocation from the player who is not issuing', () => {
    // Black is issuing, so White has no orders to give.
    const { state } = stateReadyToIssue();

    // The refusal names who is issuing.
    expect(
      isValidIssueCommandsEvent(
        createIssueCommandsEvent({
          allocation: { allocationType: 'units', units: [] },
          player: 'white',
        }),
        state,
      ),
    ).toStrictEqual({
      errorReason: 'Expected issue commands from black, got white',
      result: false,
    });
  });

  it('throws when asked outside the issue commands phase, which the expected check rules out first', () => {
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
    const event = createIssueCommandsEvent({
      player: 'black',
      allocation: { allocationType: 'units', units: [unit.unit] },
    });

    // An order given while the cards are being chosen is refused by the
    // expected check before membership is asked; reaching here is a fault.
    expect(() => isValidIssueCommandsEvent(event, state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });
});
