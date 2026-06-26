import type { ResolveRallyEvent } from '@events';
import { throwIfNone, throwIfPending } from '@utils';
import { CLEANUP_PHASE } from '@game';

import { createEmptyGameState, createTestCard } from '@testing';

import { applyResolveRallyEvent } from './applyResolveRallyEvent';

/**
 * Resolving a rally: the chosen card leaves `played`, the engine marks the per-player rally
 * slice `rallyResolved`, and cleanup advances past that resolve step.
 */
describe(applyResolveRallyEvent, () => {
  it('given firstPlayerResolveRally with white played card, card consumed played empty and rallyResolved', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    const card = createTestCard();
    state.cardState.white.played = [card];

    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: 'pending',
        unitsLostSupport: 'pending',
      },
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: 'pending',
      step: 'firstPlayerResolveRally',
    };

    const full = state;
    const event: ResolveRallyEvent = {
      card,
      effectType: 'resolveRally' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
      player: 'white' as const,
    };

    const next = applyResolveRallyEvent(event, full);
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== CLEANUP_PHASE) {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('secondPlayerChooseRally');
    const rally = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    expect(rally.rallyResolved).toBeTruthy();
    expect(next.cardState.white.played).toStrictEqual([]);
  });
});
