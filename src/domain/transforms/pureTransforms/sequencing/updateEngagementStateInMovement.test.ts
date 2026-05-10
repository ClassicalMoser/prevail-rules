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

import { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

/**
 * UpdateEngagementStateInMovement: Updates the engagement state within the current movement resolution (issue commands phase).
 */
describe(updateEngagementStateInMovement, () => {
  it('updates engagement state in movement resolution', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state, {
        engagementState: createFrontEngagementState(),
      }),
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    const engagementState = getFrontEngagementStateFromMovement(stateInPhase);
    const newEngagementState = {
      ...engagementState,
      engagementResolutionState: {
        ...engagementState.engagementResolutionState,
        defendingUnitRetreats: true,
      },
    };

    const newState = updateEngagementStateInMovement(
      stateInPhase,
      newEngagementState,
    );

    const updated = getFrontEngagementStateFromMovement(newState);
    expect(
      updated.engagementResolutionState.defendingUnitRetreats,
    ).toBeTruthy();
  });

  it('throws when not in issueCommands phase', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const engagementState = createFrontEngagementState();

    expect(() =>
      updateEngagementStateInMovement(stateInPlayCards, engagementState),
    ).toThrow('Not in issueCommands phase');
  });

  it('throws when command resolution is not movement', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const engagementState = createFrontEngagementState();

    expect(() =>
      updateEngagementStateInMovement(stateInPhase, engagementState),
    ).toThrow('Current command resolution is not a movement');
  });
});
