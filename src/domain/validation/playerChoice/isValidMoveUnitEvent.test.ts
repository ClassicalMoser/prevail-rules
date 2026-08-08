import type { MoveUnitEvent } from '@events';
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

import { isValidMoveUnitEvent } from './isValidMoveUnitEvent';

/**
 * IsValidMoveUnitEvent: unit atom + destination + moveCommander integrity.
 */
describe(isValidMoveUnitEvent, () => {
  function stateAwaitingMoveUnit(options?: { withCommander?: boolean }) {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { speed: 2 },
    });
    let state = createEmptyGameState({ currentInitiative: 'black' });
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
    const event: MoveUnitEvent = {
      choiceType: 'moveUnit',
      eventNumber: 0,
      eventType: 'playerChoice',
      moveCommander: false,
      player: 'black',
      to: { coordinate: 'E-4', facing: 'north' },
      unit: unitWithPlacement,
    };

    expect(isValidMoveUnitEvent(event, state)).toStrictEqual({ result: true });
  });

  it('accepts moveCommander when the commander shares the unit space', () => {
    const { state, unitWithPlacement } = stateAwaitingMoveUnit({
      withCommander: true,
    });
    const event: MoveUnitEvent = {
      choiceType: 'moveUnit',
      eventNumber: 0,
      eventType: 'playerChoice',
      moveCommander: true,
      player: 'black',
      to: { coordinate: 'E-4', facing: 'north' },
      unit: unitWithPlacement,
    };

    expect(isValidMoveUnitEvent(event, state)).toStrictEqual({ result: true });
  });

  it('rejects moveCommander when the commander is not co-located', () => {
    const { state, unitWithPlacement } = stateAwaitingMoveUnit();
    const event: MoveUnitEvent = {
      choiceType: 'moveUnit',
      eventNumber: 0,
      eventType: 'playerChoice',
      moveCommander: true,
      player: 'black',
      to: { coordinate: 'E-4', facing: 'north' },
      unit: unitWithPlacement,
    };

    expect(isValidMoveUnitEvent(event, state).result).toBe(false);
  });

  it('rejects an illegal destination', () => {
    const { state, unitWithPlacement } = stateAwaitingMoveUnit();
    const event: MoveUnitEvent = {
      choiceType: 'moveUnit',
      eventNumber: 0,
      eventType: 'playerChoice',
      moveCommander: false,
      player: 'black',
      to: { coordinate: 'A-1', facing: 'north' },
      unit: unitWithPlacement,
    };

    expect(isValidMoveUnitEvent(event, state).result).toBe(false);
  });

  it('rejects when moveUnit is not expected', () => {
    const unitWithPlacement = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event: MoveUnitEvent = {
      choiceType: 'moveUnit',
      eventNumber: 0,
      eventType: 'playerChoice',
      moveCommander: false,
      player: 'black',
      to: { coordinate: 'E-4', facing: 'north' },
      unit: unitWithPlacement,
    };

    expect(isValidMoveUnitEvent(event, state).result).toBe(false);
  });
});
