import type { EngagementState, GameState } from '@game';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import {
  getEngagementStateFromMovement,
  getFlankEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
  getRearEngagementStateFromMovement,
} from './engagement';

import { createEmptyGameState } from '@factories';

/**
 * Movement engagement: the slice on the current movement, narrowed to front, flank, or rear.
 */
function gameWithMovementEngagement(
  engagementState: EngagementState | 'pending',
): GameState {
  const state = createEmptyGameState('standard');
  return updatePhaseState(
    state,
    createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state, {
        engagementState,
      }),
    }),
  );
}

describe(getEngagementStateFromMovement, () => {
  it('returns the engagement on the movement', () => {
    const engagement = createFrontEngagementState();
    const state = gameWithMovementEngagement(engagement);

    expect(getEngagementStateFromMovement(state)).toBe(engagement);
  });

  it('throws when the movement has no engagement', () => {
    const state = gameWithMovementEngagement('pending');

    expect(() => getEngagementStateFromMovement(state)).toThrow(
      'No engagement state found in movement resolution',
    );
  });

  it('throws when the command is not a movement', () => {
    const state = createEmptyGameState('standard');
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createRangedAttackResolutionState(state),
      }),
    );

    expect(() => getEngagementStateFromMovement(stateInPhase)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});

describe(getFlankEngagementStateFromMovement, () => {
  it('returns the flank engagement on the movement', () => {
    const engagement = createFlankEngagementState();
    const state = gameWithMovementEngagement(engagement);

    const result = getFlankEngagementStateFromMovement(state);

    expect(result.engagementResolutionState).toBe(
      engagement.engagementResolutionState,
    );
    expect(result.engagingUnit).toBe(engagement.engagingUnit);
  });

  it('throws when the engagement is not flank', () => {
    const state = gameWithMovementEngagement(createFrontEngagementState());

    expect(() => getFlankEngagementStateFromMovement(state)).toThrow(
      'Engagement type is not flank',
    );
  });
});

describe(getFrontEngagementStateFromMovement, () => {
  it('returns the front engagement on the movement', () => {
    const engagement = createFrontEngagementState();
    const state = gameWithMovementEngagement(engagement);

    const result = getFrontEngagementStateFromMovement(state);

    expect(result.engagementResolutionState).toBe(
      engagement.engagementResolutionState,
    );
    expect(result.engagingUnit).toBe(engagement.engagingUnit);
  });

  it('throws when the engagement is not front', () => {
    const state = gameWithMovementEngagement(createFlankEngagementState());

    expect(() => getFrontEngagementStateFromMovement(state)).toThrow(
      'Engagement type is not front',
    );
  });
});

describe(getRearEngagementStateFromMovement, () => {
  it('returns the rear engagement on the movement', () => {
    const engagement = createRearEngagementState();
    const state = gameWithMovementEngagement(engagement);

    const result = getRearEngagementStateFromMovement(state);

    expect(result.engagementResolutionState).toBe(
      engagement.engagementResolutionState,
    );
    expect(result.engagingUnit).toBe(engagement.engagingUnit);
  });

  it('throws when the engagement is not rear', () => {
    const state = gameWithMovementEngagement(createFrontEngagementState());

    expect(() => getRearEngagementStateFromMovement(state)).toThrow(
      'Engagement type is not rear',
    );
  });
});
