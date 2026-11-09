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

import { isValidMoveUnitEvent } from './isValidMoveUnitEvent';

import { createEmptyGameState, createMoveUnitEvent } from '@factories';
/**
 * IsValidMoveUnitEvent: unit atom + destination + moveCommander integrity.
 */
describe('isValidMoveUnitEvent function', () => {
  function stateAwaitingMoveUnit(options?: { withCommander?: boolean }) {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { speed: 2 },
    });
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: tempCommandCards[0],
      },
    });
    let board = addUnitToBoard(state.boardState, unitWithPlacement);
    if (options?.withCommander) {
      board = addCommanderToBoard(board, 'black', 'E-5');
    }
    state = updateBoardState(state, board);
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [unitWithPlacement.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );
    return { state, unitWithPlacement };
  }

  it('accepts a legal destination without moving the commander', () => {
    const { state, unitWithPlacement } = stateAwaitingMoveUnit();
    const event = createMoveUnitEvent({
      eventNumber: 0,
      moveCommander: false,
      player: 'black',
      // One step straight ahead, from E-5 to D-5.
      path: ['step'],
      unit: unitWithPlacement,
    });

    expect(isValidMoveUnitEvent(event, state)).toStrictEqual({ result: true });
  });

  it('accepts moveCommander when the commander shares the unit space', () => {
    const { state, unitWithPlacement } = stateAwaitingMoveUnit({
      withCommander: true,
    });
    const event = createMoveUnitEvent({
      eventNumber: 0,
      moveCommander: true,
      player: 'black',
      path: ['step'],
      unit: unitWithPlacement,
    });

    expect(isValidMoveUnitEvent(event, state)).toStrictEqual({ result: true });
  });

  it('rejects moveCommander when the commander is not co-located', () => {
    const { state, unitWithPlacement } = stateAwaitingMoveUnit();
    const event = createMoveUnitEvent({
      eventNumber: 0,
      moveCommander: true,
      player: 'black',
      path: ['step'],
      unit: unitWithPlacement,
    });

    expect(isValidMoveUnitEvent(event, state).result).toBe(false);
  });

  it('rejects a path the unit cannot walk', () => {
    const { state, unitWithPlacement } = stateAwaitingMoveUnit();
    const event = createMoveUnitEvent({
      eventNumber: 0,
      moveCommander: false,
      player: 'black',
      // Nine steps: more Speed than any unit has.
      path: Array.from({ length: 9 }, () => 'step' as const),
      unit: unitWithPlacement,
    });

    expect(isValidMoveUnitEvent(event, state).result).toBe(false);
  });

  it('rejects when moveUnit is not expected', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createMoveUnitEvent({
      eventNumber: 0,
      moveCommander: false,
      player: 'black',
      path: ['step'],
      unit: unitWithPlacement,
    });

    expect(isValidMoveUnitEvent(event, state).result).toBe(false);
  });
});
