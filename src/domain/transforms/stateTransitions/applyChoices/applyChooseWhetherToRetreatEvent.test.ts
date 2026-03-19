import type { StandardBoard } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import { getFrontEngagementStateFromMovement } from '@queries';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyChooseWhetherToRetreatEvent } from './applyChooseWhetherToRetreatEvent';

describe('applyChooseWhetherToRetreatEvent', () => {
  function createStateWithFrontEngagement() {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state, {
        engagementState: createFrontEngagementState(),
      }),
    });
    return updatePhaseState(state, phaseState);
  }

  it('sets defendingUnitRetreats true when player chooses to retreat', () => {
    const state = createStateWithFrontEngagement();
    const event: ChooseWhetherToRetreatEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseWhetherToRetreat',
      player: 'white',
      choosesToRetreat: true,
    };

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const engagementState = getFrontEngagementStateFromMovement(newState);

    expect(
      engagementState.engagementResolutionState.defendingUnitRetreats,
    ).toBe(true);
  });

  it('sets defendingUnitRetreats false when player chooses not to retreat', () => {
    const state = createStateWithFrontEngagement();
    const event: ChooseWhetherToRetreatEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseWhetherToRetreat',
      player: 'white',
      choosesToRetreat: false,
    };

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const engagementState = getFrontEngagementStateFromMovement(newState);

    expect(
      engagementState.engagementResolutionState.defendingUnitRetreats,
    ).toBe(false);
  });

  it('throws when not in issueCommands phase', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const event: ChooseWhetherToRetreatEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseWhetherToRetreat',
      player: 'white',
      choosesToRetreat: true,
    };

    expect(() =>
      applyChooseWhetherToRetreatEvent(event, stateInPlayCards),
    ).toThrow('Not in issueCommands phase');
  });

  it('throws when command resolution is not movement (no front engagement)', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const event: ChooseWhetherToRetreatEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseWhetherToRetreat',
      player: 'white',
      choosesToRetreat: true,
    };

    expect(() => applyChooseWhetherToRetreatEvent(event, stateInPhase)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});
