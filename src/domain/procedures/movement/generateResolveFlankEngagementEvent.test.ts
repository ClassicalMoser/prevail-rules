import {
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateMovingInto,
} from '@testing';

import { generateResolveFlankEngagementEvent } from './generateResolveFlankEngagementEvent';

/** A defender engaged from the flank is turned to face its attacker (§6.3.4). */
describe('generateResolveFlankEngagementEvent function', () => {
  it('carries nothing, since the movement and the board hold the attacker and the defender', () => {
    // A move has engaged its defender from the flank.
    const state = createGameStateMovingInto(createFlankEngagementState());

    // The defender's new facing follows from the attacker's, which the
    // movement records; the effect names only itself.
    expect(generateResolveFlankEngagementEvent(state)).toStrictEqual({
      effectType: 'resolveFlankEngagement',
      eventType: 'gameEffect',
    });
  });

  it('refuses a front engagement, whose defender is not turned', () => {
    // A move has engaged its defender head-on instead.
    const state = createGameStateMovingInto(createFrontEngagementState());

    // A front defender may fall back rather than be turned (§6.3.2).
    expect(() => generateResolveFlankEngagementEvent(state)).toThrow(
      'Engagement type is not flank',
    );
  });
});
