import type { EngagementState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRearEngagementStateFromMovement } from './findRearEngagementStateFromMovement';

/**
 * A Move order being carried out, its unit having walked into an enemy with
 * this engagement, or not yet having met anyone (`'pending'`).
 */
function movingWith(engagementState: EngagementState | 'pending'): GameState {
  const empty = createEmptyGameState('standard');
  const state = updatePhaseState(
    empty,
    createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: createMovementResolutionState(empty, {
        engagementState,
      }),
    }),
  );
  return state;
}

/** A unit engaged from the rear routs outright (§6.3.3). */
describe('findRearEngagementStateFromMovement function', () => {
  it('returns the rear engagement the movement opened', () => {
    // The mover came from behind the defender.
    const engagement = createRearEngagementState();

    expect(
      findRearEngagementStateFromMovement(movingWith(engagement)),
    ).toStrictEqual(engagement);
  });

  it('answers undefined when the movement opened a front or a flank engagement', () => {
    // Met head on or from the side, the defender does not rout on the spot.
    expect(
      findRearEngagementStateFromMovement(
        movingWith(createFrontEngagementState()),
      ),
    ).toBeUndefined();
    expect(
      findRearEngagementStateFromMovement(
        movingWith(createFlankEngagementState()),
      ),
    ).toBeUndefined();
  });

  it('answers undefined when the movement has reached no engagement', () => {
    // The unit is moving, but has not stepped into an enemy.
    expect(
      findRearEngagementStateFromMovement(movingWith('pending')),
    ).toBeUndefined();
  });

  it('answers undefined when no movement is being carried out', () => {
    // Setup: nobody is moving at all.
    expect(
      findRearEngagementStateFromMovement(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});
