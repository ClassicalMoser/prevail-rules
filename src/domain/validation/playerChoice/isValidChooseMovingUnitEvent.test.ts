import { PLAY_CARDS_PHASE } from '@game';
import { createChooseMovingUnitEvent, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createTestCard,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms';

import { isValidChooseMovingUnitEvent } from './isValidChooseMovingUnitEvent';

/**
 * Naming the next unit to move under a Move order (§4.3.10): one of the
 * ordered units still to move, standing where the board has it.
 *
 * Black carries out a Move card for its unit on E-5 facing north.
 */
describe('isValidChooseMovingUnitEvent function', () => {
  const ordered = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'north',
    playerSide: 'black',
  });

  function resolvingOrder() {
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: createTestCard() },
    });
    state = updateBoardState(state, addUnitToBoard(state.boardState, ordered));
    const resolving = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [ordered.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );
    return resolving;
  }

  it('accepts an ordered unit still to move', () => {
    const event = createChooseMovingUnitEvent({
      player: 'black',
      unit: ordered,
    });

    expect(isValidChooseMovingUnitEvent(event, resolvingOrder())).toStrictEqual(
      { result: true },
    );
  });

  it('refuses the unit named where it does not stand', () => {
    // The same unit, claimed to stand one space off.
    const event = createChooseMovingUnitEvent({
      player: 'black',
      unit: { ...ordered, placement: { coordinate: 'D-5', facing: 'north' } },
    });

    expect(isValidChooseMovingUnitEvent(event, resolvingOrder()).result).toBe(
      false,
    );
  });

  it('refuses the other side naming a unit', () => {
    const event = createChooseMovingUnitEvent({
      player: 'white',
      unit: ordered,
    });

    expect(isValidChooseMovingUnitEvent(event, resolvingOrder())).toStrictEqual(
      {
        errorReason: 'Expected a unit to move from black, got white',
        result: false,
      },
    );
  });

  it('throws when asked where no Move order is being carried out, which the expected check rules out first', () => {
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      },
    );
    const event = createChooseMovingUnitEvent({
      player: 'black',
      unit: ordered,
    });

    // A unit named while cards are chosen is refused by the expected check
    // before membership is asked; reaching here is a fault.
    expect(() => isValidChooseMovingUnitEvent(event, state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });
});
