import { PLAY_CARDS_PHASE } from '@game';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidChooseWhetherToRetreatEvent } from './isValidChooseWhetherToRetreatEvent';

import {
  createChooseWhetherToRetreatEvent,
  createEmptyGameState,
} from '@factories';
/**
 * IsValidChooseWhetherToRetreatEvent: membership against
 * getLegalChooseWhetherToRetreatEvents.
 */
describe('isValidChooseWhetherToRetreatEvent function', () => {
  function stateAwaitingWhetherToRetreat() {
    const state = createEmptyGameState('standard');
    const movement = createMovementResolutionState(state, {
      engagementState: createFrontEngagementState({
        retreatPaths: [['step']],
        defendingUnitRetreats: 'pending',
        defensiveCommitment: {
          card: createTestCard(),
          commitmentType: 'completed',
        },
      }),
    });
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );
  }

  it('accepts choosing to retreat', () => {
    const state = stateAwaitingWhetherToRetreat();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    expect(isValidChooseWhetherToRetreatEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts choosing not to retreat', () => {
    const state = stateAwaitingWhetherToRetreat();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: false,
      player: 'white',
    });

    expect(isValidChooseWhetherToRetreatEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects the wrong player', () => {
    const state = stateAwaitingWhetherToRetreat();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'black',
    });

    expect(isValidChooseWhetherToRetreatEvent(event, state).result).toBe(false);
  });

  it('throws when no defender is deciding, which the expected check rules out first', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidChooseWhetherToRetreatEvent(event, state)).toThrow(
      'No front engagement is being resolved',
    );
  });
});
