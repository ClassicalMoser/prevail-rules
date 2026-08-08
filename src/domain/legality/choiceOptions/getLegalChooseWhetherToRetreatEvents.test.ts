import { PLAY_CARDS_PHASE } from '@game';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalChooseWhetherToRetreatEvents } from './getLegalChooseWhetherToRetreatEvents';

/**
 * GetLegalChooseWhetherToRetreatEvents: yes/no for the front-engagement
 * defender when defendingUnitRetreats is pending and retreat is allowed.
 */
describe(getLegalChooseWhetherToRetreatEvents, () => {
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

  it('returns yes and no for the defending player', () => {
    const state = stateAwaitingWhetherToRetreat();

    expect(getLegalChooseWhetherToRetreatEvents(state)).toStrictEqual([
      {
        choiceType: 'chooseWhetherToRetreat',
        choosesToRetreat: true,
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      },
      {
        choiceType: 'chooseWhetherToRetreat',
        choosesToRetreat: false,
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      },
    ]);
  });

  it('returns empty when not awaiting the retreat decision', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalChooseWhetherToRetreatEvents(state)).toStrictEqual([]);
  });

  it('returns empty when the defender cannot retreat', () => {
    const state = createEmptyGameState();
    const movement = createMovementResolutionState(state, {
      engagementState: createFrontEngagementState({
        defendingUnitCanRetreat: false,
        defendingUnitRetreated: 'pending',
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

    expect(getLegalChooseWhetherToRetreatEvents(inPhase)).toStrictEqual([]);
  });
});
