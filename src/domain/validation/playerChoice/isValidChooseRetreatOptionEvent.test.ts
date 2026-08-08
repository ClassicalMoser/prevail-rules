import type { UnitWithPlacement } from '@entities';
import type { ChooseRetreatOptionEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { isValidChooseRetreatOptionEvent } from './isValidChooseRetreatOptionEvent';

/**
 * IsValidChooseRetreatOptionEvent: membership against getLegalChooseRetreatOptionEvents.
 */
describe(isValidChooseRetreatOptionEvent, () => {
  const optionA = { coordinate: 'E-4' as const, facing: 'north' as const };
  const optionB = { coordinate: 'E-6' as const, facing: 'north' as const };

  function stateWithRangedRetreat() {
    const state = createEmptyGameState();
    const unit = createTestUnit('white');
    const placement: UnitWithPlacement = {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit,
    };
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
    const event: ChooseRetreatOptionEvent = {
      choiceType: 'chooseRetreatOption',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      retreatOption: optionB,
    };

    expect(isValidChooseRetreatOptionEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a placement that is not among legalRetreatOptions', () => {
    const state = stateWithRangedRetreat();
    const event: ChooseRetreatOptionEvent = {
      choiceType: 'chooseRetreatOption',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      retreatOption: { coordinate: 'A-1', facing: 'south' },
    };

    const validation = isValidChooseRetreatOptionEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('A-1');
  });

  it('rejects when no retreat choice is expected', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event: ChooseRetreatOptionEvent = {
      choiceType: 'chooseRetreatOption',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      retreatOption: optionA,
    };

    expect(isValidChooseRetreatOptionEvent(event, state).result).toBe(false);
  });
});
