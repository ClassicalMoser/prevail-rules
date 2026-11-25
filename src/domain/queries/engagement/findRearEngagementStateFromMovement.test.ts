import { createEmptyGameState } from '@factories';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateMovingInto,
  createRearEngagementState,
} from '@testing';

import { findRearEngagementStateFromMovement } from './findRearEngagementStateFromMovement';

/** A unit engaged from the rear routs outright (§6.3.3). */
describe('findRearEngagementStateFromMovement function', () => {
  it('returns the rear engagement the movement opened', () => {
    // The mover came from behind the defender.
    const engagement = createRearEngagementState();

    expect(
      findRearEngagementStateFromMovement(
        createGameStateMovingInto(engagement),
      ),
    ).toStrictEqual(engagement);
  });

  it('answers undefined when the movement opened a front or a flank engagement', () => {
    // Met head on or from the side, the defender does not rout on the spot.
    expect(
      findRearEngagementStateFromMovement(
        createGameStateMovingInto(createFrontEngagementState()),
      ),
    ).toBeUndefined();
    expect(
      findRearEngagementStateFromMovement(
        createGameStateMovingInto(createFlankEngagementState()),
      ),
    ).toBeUndefined();
  });

  it('answers undefined when the movement has reached no engagement', () => {
    // The unit is moving, but has not stepped into an enemy.
    expect(
      findRearEngagementStateFromMovement(createGameStateMovingInto('pending')),
    ).toBeUndefined();
  });

  it('answers undefined when no movement is being carried out', () => {
    // Setup: nobody is moving at all.
    expect(
      findRearEngagementStateFromMovement(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});
