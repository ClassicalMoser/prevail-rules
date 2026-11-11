import { createEmptyGameState } from '@factories';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findFrontEngagementStateFromMovement } from './findFrontEngagementStateFromMovement';

describe('findFrontEngagementStateFromMovement function', () => {
  it('returns the front engagement the movement opened', () => {
    const empty = createEmptyGameState('standard');
    const engagement = createFrontEngagementState();
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createMovementResolutionState(empty, {
          engagementState: engagement,
        }),
      }),
    );

    expect(findFrontEngagementStateFromMovement(state)).toStrictEqual(
      engagement,
    );
  });

  it('answers undefined when the movement has reached no engagement', () => {
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createMovementResolutionState(empty, {
          engagementState: 'pending',
        }),
      }),
    );

    expect(findFrontEngagementStateFromMovement(state)).toBeUndefined();
  });

  it('answers undefined when no order is under way', () => {
    expect(
      findFrontEngagementStateFromMovement(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});
