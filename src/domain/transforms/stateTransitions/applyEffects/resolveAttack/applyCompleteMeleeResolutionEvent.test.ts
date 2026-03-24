import type { GameState, StandardBoard } from '@entities';
import type { CompleteMeleeResolutionEvent } from '@events';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyCompleteMeleeResolutionEvent } from './applyCompleteMeleeResolutionEvent';

/**
 * One melee hex is fully resolved: drop `currentMeleeResolutionState` so the phase can pick
 * the next engagement or eventually complete the resolve-melee phase.
 */
describe('applyCompleteMeleeResolutionEvent', () => {
  it('given resolveMelee with an active melee slice, after effect currentMeleeResolutionState is undefined', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      white: { ...c.white, inPlay: createTestCard() },
      black: { ...c.black, inPlay: createTestCard() },
    }));
    const melee = createMeleeResolutionState(withCards);
    const full: GameState<StandardBoard> = updatePhaseState(
      withCards,
      createResolveMeleePhaseState(withCards, {
        currentMeleeResolutionState: melee,
      }),
    );

    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'completeMeleeResolution' as const,
    } satisfies CompleteMeleeResolutionEvent<StandardBoard>;

    const next = applyCompleteMeleeResolutionEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== 'resolveMelee')
      throw new Error('melee phase');
    expect(phase.currentMeleeResolutionState).toBeUndefined();
  });
});
