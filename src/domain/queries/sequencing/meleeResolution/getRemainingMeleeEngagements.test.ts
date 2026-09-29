import type { Coordinate } from '@entities';
import { createResolveMeleePhaseState } from '@testing';

import { getRemainingMeleeEngagements } from './getRemainingMeleeEngagements';

import { createEmptyGameState } from '@factories';
describe(getRemainingMeleeEngagements, () => {
  it('returns remainingEngagements from resolve-melee phase state (same reference)', () => {
    const state = createEmptyGameState('standard');
    const remaining: Coordinate[] = ['E-5', 'E-6'];
    const phase = createResolveMeleePhaseState(state, {
      remainingEngagements: remaining,
    });

    const got = getRemainingMeleeEngagements(phase);

    expect(got).toBe(phase.remainingEngagements);
    expect(got).toBe(remaining);
  });

  it('reflects overrides when the set is replaced on the phase object', () => {
    const state = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(state);
    const next: Coordinate[] = ['E-4'];
    phase.remainingEngagements = next;

    expect(getRemainingMeleeEngagements(phase)).toBe(next);
  });
});
