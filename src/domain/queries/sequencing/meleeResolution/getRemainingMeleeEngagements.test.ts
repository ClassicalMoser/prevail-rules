import type { Coordinate } from '@entities';
import { createEmptyGameState } from '@factories';
import { createResolveMeleePhaseState } from '@testing';

import { getRemainingMeleeEngagements } from './getRemainingMeleeEngagements';

/**
 * The coordinates still waiting for melee on a resolve-melee phase.
 */
describe('getRemainingMeleeEngagements function', () => {
  it('returns the remaining engagements on the phase', () => {
    const remaining: Coordinate[] = ['E-5', 'E-6'];
    const phase = createResolveMeleePhaseState(
      createEmptyGameState('standard'),
      {
        remainingEngagements: remaining,
      },
    );

    expect(getRemainingMeleeEngagements(phase)).toBe(remaining);
  });
});
