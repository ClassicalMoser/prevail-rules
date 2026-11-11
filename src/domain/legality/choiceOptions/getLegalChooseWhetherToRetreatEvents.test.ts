import { PLAY_CARDS_PHASE } from '@game';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalChooseWhetherToRetreatEvents } from './getLegalChooseWhetherToRetreatEvents';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalChooseWhetherToRetreatEvents: yes/no for the front-engagement
 * defender when defendingUnitRetreats is pending and retreat is allowed.
 */
describe('getLegalChooseWhetherToRetreatEvents function', () => {
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

  it('returns yes and no for the defending player', () => {
    const state = stateAwaitingWhetherToRetreat();

    expect(getLegalChooseWhetherToRetreatEvents(state)).toStrictEqual([
      {
        choiceType: 'chooseWhetherToRetreat',
        choosesToRetreat: true,
        eventType: 'playerChoice',
        player: 'white',
      },
      {
        choiceType: 'chooseWhetherToRetreat',
        choosesToRetreat: false,
        eventType: 'playerChoice',
        player: 'white',
      },
    ]);
  });

  it('throws when no front engagement is being resolved, where nothing asks', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(() => getLegalChooseWhetherToRetreatEvents(state)).toThrow(
      'No front engagement is being resolved',
    );
  });

  it('throws when the defender cannot retreat, since it is not asked', () => {
    const state = createEmptyGameState('standard');
    const movement = createMovementResolutionState(state, {
      engagementState: createFrontEngagementState({
        retreatPaths: [],
        defendingUnitRetreats: 'pending',
        defensiveCommitment: {
          card: createTestCard(),
          commitmentType: 'completed',
        },
      }),
    });
    const inPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(() => getLegalChooseWhetherToRetreatEvents(inPhase)).toThrow(
      'The defender has nowhere to retreat to',
    );
  });
});
