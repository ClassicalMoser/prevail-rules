import type { ChooseWhetherToRetreatEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidChooseWhetherToRetreatEvent } from './isValidChooseWhetherToRetreatEvent';

/**
 * IsValidChooseWhetherToRetreatEvent: membership against
 * getLegalChooseWhetherToRetreatEvents.
 */
describe(isValidChooseWhetherToRetreatEvent, () => {
  function stateAwaitingWhetherToRetreat() {
    const state = createEmptyGameState();
    const movement = createMovementResolutionState(state, {
      engagementState: createFrontEngagementState({
        defendingUnitCanRetreat: true,
        defendingUnitRetreated: 'pending',
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
    const event: ChooseWhetherToRetreatEvent = {
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: true,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    expect(isValidChooseWhetherToRetreatEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts choosing not to retreat', () => {
    const state = stateAwaitingWhetherToRetreat();
    const event: ChooseWhetherToRetreatEvent = {
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: false,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    expect(isValidChooseWhetherToRetreatEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects the wrong player', () => {
    const state = stateAwaitingWhetherToRetreat();
    const event: ChooseWhetherToRetreatEvent = {
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: true,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    expect(isValidChooseWhetherToRetreatEvent(event, state).result).toBe(false);
  });

  it('rejects when the choice is not expected', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event: ChooseWhetherToRetreatEvent = {
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: true,
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    expect(isValidChooseWhetherToRetreatEvent(event, state).result).toBe(false);
  });
});
