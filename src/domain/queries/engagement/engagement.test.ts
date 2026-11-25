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

describe('getEngagementStateFromMovement function', () => {
  it('returns the engagement on the movement', () => {
    // The moving unit has walked into an enemy.
    const engagement = createFrontEngagementState();
    const state = movingWith(engagement);

    expect(getEngagementStateFromMovement(state)).toBe(engagement);
  });

  it('throws when the movement has no engagement', () => {
    // The unit is moving, but has met nobody yet.
    const state = movingWith('pending');

    expect(() => getEngagementStateFromMovement(state)).toThrow(
      'No engagement state found in movement resolution',
    );
  });

  it('throws when the command is not a movement', () => {
    // A Shoot order: nobody walks into anyone.
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

describe('getFlankEngagementStateFromMovement function', () => {
  it('returns the flank engagement on the movement', () => {
    // The mover came at the defender across its facing.
    const engagement = createFlankEngagementState();
    const state = movingWith(engagement);

    const result = getFlankEngagementStateFromMovement(state);

    // The same resolution comes back, now known to be a flank one.
    expect(result.engagementResolutionState).toBe(
      engagement.engagementResolutionState,
    );
  });

  it('throws when the engagement is not flank', () => {
    // A head-on engagement asked for as a flank one.
    const state = movingWith(createFrontEngagementState());

    expect(() => getFlankEngagementStateFromMovement(state)).toThrow(
      'Engagement type is not flank',
    );
  });
});

describe('getFrontEngagementStateFromMovement function', () => {
  it('returns the front engagement on the movement', () => {
    // The mover squared up to the defender as it closed.
    const engagement = createFrontEngagementState();
    const state = movingWith(engagement);

    const result = getFrontEngagementStateFromMovement(state);

    // The same resolution comes back, now known to be a front one.
    expect(result.engagementResolutionState).toBe(
      engagement.engagementResolutionState,
    );
  });

  it('throws when the engagement is not front', () => {
    // A flank engagement asked for as a front one.
    const state = movingWith(createFlankEngagementState());

    expect(() => getFrontEngagementStateFromMovement(state)).toThrow(
      'Engagement type is not front',
    );
  });
});

describe('getRearEngagementStateFromMovement function', () => {
  it('returns the rear engagement on the movement', () => {
    // The mover came from behind the defender.
    const engagement = createRearEngagementState();
    const state = movingWith(engagement);

    const result = getRearEngagementStateFromMovement(state);

    // The same resolution comes back, now known to be a rear one.
    expect(result.engagementResolutionState).toBe(
      engagement.engagementResolutionState,
    );
  });

  it('throws when the engagement is not rear', () => {
    // A head-on engagement asked for as a rear one.
    const state = movingWith(createFrontEngagementState());

    expect(() => getRearEngagementStateFromMovement(state)).toThrow(
      'Engagement type is not rear',
    );
  });
});
