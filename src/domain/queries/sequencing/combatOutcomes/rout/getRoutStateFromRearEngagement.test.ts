import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRoutStateFromRearEngagement } from './getRoutStateFromRearEngagement';

import { createEmptyGameState } from '@factories';
/**
 * Rear-contact movement: the nested rear engagement must carry a rout substep; this unwraps it
 * from issueCommands + movement CRS with validation.
 */
describe('getRoutStateFromRearEngagement function', () => {
  it('returns the rout on the rear engagement', () => {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white');
    const routState = createRoutState('white', whiteUnit, {
      numberToDiscard: 2,
    });
    const movement = createMovementResolutionState(state, {
      engagementState: createRearEngagementState({ routState }),
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(getRoutStateFromRearEngagement(full)).toBe(routState);
  });

  it('throws when the movement has no engagement', () => {
    const state = createEmptyGameState('standard');
    const movement = createMovementResolutionState(state, {
      engagementState: 'pending',
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(() => getRoutStateFromRearEngagement(full)).toThrow(
      'Movement resolution has no engagement state',
    );
  });

  it('throws when the engagement is a front engagement', () => {
    const state = createEmptyGameState('standard');
    const movement = createMovementResolutionState(state, {
      engagementState: createFrontEngagementState(),
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(() => getRoutStateFromRearEngagement(full)).toThrow(
      'Expected rear engagement for movement rout, got front',
    );
  });
});
