import type { Coordinate } from '@entities';
import { createEmptyGameState } from '@factories';
import { createResolveMeleePhaseState } from '@testing';

import { getRemainingMeleeEngagements } from './getRemainingMeleeEngagements';

/** Every engaged space fights in Phase 4, one at a time (§4.4.1, §4.4.2). */
describe('getRemainingMeleeEngagements function', () => {
  it('returns the spaces still waiting to fight', () => {
    // Two engaged spaces have not yet been fought this phase.
    const remaining: Coordinate[] = ['E-5', 'E-6'];
    const phase = createResolveMeleePhaseState(
      createEmptyGameState('standard'),
      { remainingEngagements: remaining },
    );

    // The same spaces the phase holds, for the first player to choose among.
    expect(getRemainingMeleeEngagements(phase)).toStrictEqual(['E-5', 'E-6']);
  });
});
