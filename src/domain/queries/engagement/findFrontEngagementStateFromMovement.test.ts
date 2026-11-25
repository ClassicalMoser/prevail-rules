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

import { findFrontEngagementStateFromMovement } from './findFrontEngagementStateFromMovement';

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

/**
 * A defender met head on may be offered a retreat (§6.3.2), so the legal
 * options ask for the front engagement softly: any other moment has none.
 */
describe('findFrontEngagementStateFromMovement function', () => {
  it('returns the front engagement the movement opened', () => {
    // The mover squared up to the defender as it closed.
    const engagement = createFrontEngagementState();

    expect(
      findFrontEngagementStateFromMovement(movingWith(engagement)),
    ).toStrictEqual(engagement);
  });

  it('answers undefined when the movement opened a flank or a rear engagement', () => {
    // A defender met from the flank is turned and may not fall back; one met
    // from the rear routs. Neither is a front engagement.
    expect(
      findFrontEngagementStateFromMovement(
        movingWith(createFlankEngagementState()),
      ),
    ).toBeUndefined();
    expect(
      findFrontEngagementStateFromMovement(
        movingWith(createRearEngagementState()),
      ),
    ).toBeUndefined();
  });

  it('answers undefined when the movement has reached no engagement', () => {
    // The unit is moving, but has not stepped into an enemy.
    expect(
      findFrontEngagementStateFromMovement(movingWith('pending')),
    ).toBeUndefined();
  });

  it('answers undefined when no order is under way', () => {
    // Setup: nobody is moving at all.
    expect(
      findFrontEngagementStateFromMovement(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});
