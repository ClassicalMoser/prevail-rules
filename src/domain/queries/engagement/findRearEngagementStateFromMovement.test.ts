import { createEmptyGameState } from '@factories';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRearEngagementStateFromMovement } from './findRearEngagementStateFromMovement';

/** A movement under way with this engagement, or none yet. */
function movingWith(
  engagementState: Parameters<typeof createMovementResolutionState>[1],
) {
  const empty = createEmptyGameState('standard');
  const state = updatePhaseState(
    empty,
    createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: createMovementResolutionState(
        empty,
        engagementState,
      ),
    }),
  );
  return state;
}

/** A unit engaged from the rear routs outright (§6.3.3). */
describe('findRearEngagementStateFromMovement function', () => {
  it('returns the rear engagement the movement opened', () => {
    const engagement = createRearEngagementState();

    expect(
      findRearEngagementStateFromMovement(
        movingWith({ engagementState: engagement }),
      ),
    ).toStrictEqual(engagement);
  });

  it('answers undefined when the movement has reached no engagement', () => {
    expect(
      findRearEngagementStateFromMovement(
        movingWith({ engagementState: 'pending' }),
      ),
    ).toBeUndefined();
  });

  it('answers undefined when the engagement is from the front', () => {
    expect(
      findRearEngagementStateFromMovement(
        movingWith({ engagementState: createFrontEngagementState() }),
      ),
    ).toBeUndefined();
  });

  it('answers undefined when no movement is being carried out', () => {
    expect(
      findRearEngagementStateFromMovement(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});
