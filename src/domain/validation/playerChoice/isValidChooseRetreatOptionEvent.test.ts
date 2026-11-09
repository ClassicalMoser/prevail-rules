import { PLAY_CARDS_PHASE } from '@game';
import type { RetreatOption } from '@game';
import {
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { isValidChooseRetreatOptionEvent } from './isValidChooseRetreatOptionEvent';

import {
  createChooseRetreatOptionEvent,
  createEmptyGameState,
  createUnitPlacement,
} from '@factories';
/**
 * IsValidChooseRetreatOptionEvent: membership against getLegalChooseRetreatOptionEvents.
 */
describe('isValidChooseRetreatOptionEvent function', () => {
  // Two tied ways back, each named by the moves it takes.
  const optionA: RetreatOption = {
    path: ['turnLeft', 'step'],
    placement: createUnitPlacement('F-6', 'northWest'),
  };
  const optionB: RetreatOption = {
    path: ['turnRight', 'step'],
    placement: createUnitPlacement('F-4', 'northEast'),
  };

  function stateWithRangedRetreat() {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white');
    const placement = placed(unit, 'E-5', 'north');
    const withUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const attackApply = createAttackApplyStateWithRetreat(placement, {
      retreatState: createRetreatState(placement, {
        legalRetreatOptions: [optionA, optionB],
      }),
    });
    return updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState(withUnit, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          withUnit,
          { attackApplyState: attackApply },
        ),
      }),
    );
  }

  it('accepts a retreat option listed on the retreat substep', () => {
    const state = stateWithRangedRetreat();
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      path: optionB.path,
    });

    expect(isValidChooseRetreatOptionEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a path that is not among legalRetreatOptions', () => {
    const state = stateWithRangedRetreat();
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      path: ['turnAbout', 'step'],
    });

    const validation = isValidChooseRetreatOptionEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('turnAbout, step');
  });

  it('rejects when no retreat choice is expected', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      path: optionA.path,
    });

    expect(isValidChooseRetreatOptionEvent(event, state).result).toBe(false);
  });
});
