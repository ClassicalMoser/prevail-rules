import { findCurrentCommandResolutionState } from '@queries';
import { createFrontEngagementState } from './frontEngagementState';
import { createGameStateMovingInto } from './gameStateMovingInto';

describe('createGameStateMovingInto function', () => {
  it('carries out a move whose unit has walked into this engagement', () => {
    // The moving unit met its enemy head on.
    const engagement = createFrontEngagementState();

    const state = createGameStateMovingInto(engagement);

    // The order under way is a move holding that engagement.
    expect(findCurrentCommandResolutionState(state)).toMatchObject({
      engagementState: engagement,
    });
  });
});
