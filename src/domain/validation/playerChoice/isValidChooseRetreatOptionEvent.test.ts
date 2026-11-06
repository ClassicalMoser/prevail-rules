import { PLAY_CARDS_PHASE } from '@game';
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
  const optionA = createUnitPlacement('E-4', 'north');
  const optionB = createUnitPlacement('E-6', 'north');

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
      retreatOption: optionB,
    });

    expect(isValidChooseRetreatOptionEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a placement that is not among legalRetreatOptions', () => {
    const state = stateWithRangedRetreat();
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      retreatOption: createUnitPlacement('A-1', 'south'),
    });

    const validation = isValidChooseRetreatOptionEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('A-1');
  });

  it('rejects when no retreat choice is expected', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createChooseRetreatOptionEvent({
      eventNumber: 0,
      player: 'white',
      retreatOption: optionA,
    });

    expect(isValidChooseRetreatOptionEvent(event, state).result).toBe(false);
  });
});
