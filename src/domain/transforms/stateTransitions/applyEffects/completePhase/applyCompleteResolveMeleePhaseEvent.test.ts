import type { StandardBoard } from '@entities';
import type { CompleteResolveMeleePhaseEvent } from '@events';
import type { StandardGameState } from '@game';
import { CLEANUP_PHASE, RESOLVE_MELEE_PHASE } from '@game';

import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyCompleteResolveMeleePhaseEvent } from './applyCompleteResolveMeleePhaseEvent';

/**
 * After all melee hexes resolve, this closes `resolveMelee`, logs it completed, and opens
 * cleanup at `discardPlayedCards` (inPlay cards still present for that step).
 */
describe('applyCompleteResolveMeleePhaseEvent', () => {
  it('given resolveMelee phase with default melee slice, next phase cleanup.discardPlayedCards and melee in completed', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      white: { ...c.white, inPlay: createTestCard() },
      black: { ...c.black, inPlay: createTestCard() },
    }));
    const melee = createMeleeResolutionState(withCards);
    const full: StandardGameState = updatePhaseState(
      withCards,
      createResolveMeleePhaseState(withCards, {
        currentMeleeResolutionState: melee,
      }),
    );

    const event = {
      eventNumber: 0,
      eventType: 'gameEffect' as const,
      effectType: 'completeResolveMeleePhase' as const,
    } satisfies CompleteResolveMeleePhaseEvent<StandardBoard>;

    const next = applyCompleteResolveMeleePhaseEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe(CLEANUP_PHASE);
    if (phase?.phase !== 'cleanup') throw new Error('cleanup');
    expect(phase.step).toBe('discardPlayedCards');
    const completed = [...next.currentRoundState.completedPhases];
    expect(completed.some((p) => p.phase === RESOLVE_MELEE_PHASE)).toBe(true);
  });
});
