import type { StandardBoardCoordinate } from '@entities';
import { createEmptyGameState, createResolveMeleePhaseState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getRemainingMeleeEngagements } from './getRemainingMeleeEngagements';

describe('getRemainingMeleeEngagements', () => {
  it('returns remainingEngagements from resolve-melee phase state (same reference)', () => {
    const state = createEmptyGameState();
    const remaining = new Set<StandardBoardCoordinate>(['E-5', 'E-6']);
    const phase = createResolveMeleePhaseState(state, {
      remainingEngagements: remaining,
    });

    const got = getRemainingMeleeEngagements(phase);

    expect(got).toBe(phase.remainingEngagements);
    expect(got).toBe(remaining);
  });

  it('reflects overrides when the set is replaced on the phase object', () => {
    const state = createEmptyGameState();
    const phase = createResolveMeleePhaseState(state);
    const next = new Set<StandardBoardCoordinate>(['E-4']);
    phase.remainingEngagements = next;

    expect(getRemainingMeleeEngagements(phase)).toBe(next);
  });
});
