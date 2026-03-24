import type { GameState, StandardBoard } from '@entities';
import type { ResolveRallyEvent } from '@events';
import { CLEANUP_PHASE } from '@entities';
import { createEmptyGameState, createTestCard } from '@testing';
import { describe, expect, it } from 'vitest';

import { applyResolveRallyEvent } from './applyResolveRallyEvent';

/**
 * Resolving a rally: the chosen card leaves `played`, the engine marks the per-player rally
 * slice `rallyResolved`, and cleanup advances past that resolve step.
 */
describe('applyResolveRallyEvent', () => {
  it('given firstPlayerResolveRally with white played card, card consumed played empty and rallyResolved', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    const card = createTestCard();
    state.cardState.white.played = [card];

    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'firstPlayerResolveRally',
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    };

    const full = state as GameState<StandardBoard>;
    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'resolveRally' as const,
      player: 'white' as const,
      card,
    } satisfies ResolveRallyEvent<StandardBoard>;

    const next = applyResolveRallyEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== CLEANUP_PHASE) throw new Error('cleanup');
    expect(phase.step).toBe('secondPlayerChooseRally');
    expect(phase.firstPlayerRallyResolutionState?.rallyResolved).toBe(true);
    expect(next.cardState.white.played).toEqual([]);
  });
});
