import { createEmptyGameState } from '@factories';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateMovingInto,
  createRearEngagementState,
} from '@testing';

import { findFrontEngagementStateFromMovement } from './findFrontEngagementStateFromMovement';

/**
 * A defender met head on may be offered a retreat (§6.3.2), so the legal
 * options ask for the front engagement softly: any other moment has none.
 */
describe('findFrontEngagementStateFromMovement function', () => {
  it('returns the front engagement the movement opened', () => {
    // The mover squared up to the defender as it closed.
    const engagement = createFrontEngagementState();

    expect(
      findFrontEngagementStateFromMovement(
        createGameStateMovingInto(engagement),
      ),
    ).toStrictEqual(engagement);
  });

  it('answers undefined when the movement opened a flank or a rear engagement', () => {
    // A defender met from the flank is turned and may not fall back; one met
    // from the rear routs. Neither is a front engagement.
    expect(
      findFrontEngagementStateFromMovement(
        createGameStateMovingInto(createFlankEngagementState()),
      ),
    ).toBeUndefined();
    expect(
      findFrontEngagementStateFromMovement(
        createGameStateMovingInto(createRearEngagementState()),
      ),
    ).toBeUndefined();
  });

  it('answers undefined when the movement has reached no engagement', () => {
    // The unit is moving, but has not stepped into an enemy.
    expect(
      findFrontEngagementStateFromMovement(
        createGameStateMovingInto('pending'),
      ),
    ).toBeUndefined();
  });

  it('answers undefined when no order is under way', () => {
    // Setup: nobody is moving at all.
    expect(
      findFrontEngagementStateFromMovement(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});
