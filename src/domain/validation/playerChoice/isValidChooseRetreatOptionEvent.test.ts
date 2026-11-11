import { PLAY_CARDS_PHASE } from '@game';
import type { MoveDelta } from '@entities';
import {
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
  legalRetreatsOf,
  enemyBlockingStraightBack,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { isValidChooseRetreatOptionEvent } from './isValidChooseRetreatOptionEvent';

import {
  createChooseRetreatOptionEvent,
  createEmptyGameState,
} from '@factories';
/**
 * IsValidChooseRetreatOptionEvent: membership against getLegalChooseRetreatOptionEvents.
 */
describe('isValidChooseRetreatOptionEvent function', () => {
  // The two tied ways back the engine offers, each named by its moves.
  const optionA: MoveDelta[] = ['turnLeft', 'step'];
  const optionB: MoveDelta[] = ['turnRight', 'step'];

  function stateWithRangedRetreat() {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white');
    const placement = placed(unit, 'E-5', 'north');
    // A black unit on F-5, its back to white's, bars the straight step back
    // and leaves two equal ways round it (§9.1.3).
    const blocker = enemyBlockingStraightBack(placement);
    const withUnit = {
      ...state,
      boardState: addUnitToBoard(
        addUnitToBoard(state.boardState, placement),
        blocker,
      ),
    };
    const tiedPaths = legalRetreatsOf(placement, [blocker]);
    const attackApply = createAttackApplyStateWithRetreat(placement, tiedPaths);
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
      player: 'white',
      path: optionB,
    });

    expect(isValidChooseRetreatOptionEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a path that is not among legalRetreatPaths', () => {
    const state = stateWithRangedRetreat();
    const event = createChooseRetreatOptionEvent({
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

  it('throws when no retreat awaits a choice, which the expected check rules out first', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createChooseRetreatOptionEvent({
      player: 'white',
      path: optionA,
    });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidChooseRetreatOptionEvent(event, state)).toThrow(
      'No retreat is awaiting its owner’s choice of destination',
    );
  });
});
