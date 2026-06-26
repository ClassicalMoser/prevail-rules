import type { StandardBoard } from '@entities';
import type { CompleteMeleeResolutionEvent } from '@events';
import type { GameStateForBoard } from '@game';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCompleteMeleeResolutionEvent } from './applyCompleteMeleeResolutionEvent';

/**
 * One melee hex is fully resolved: drop `currentMeleeResolutionState` so the phase can pick
 * the next engagement or eventually complete the resolve-melee phase.
 */
describe(applyCompleteMeleeResolutionEvent, () => {
  it('given resolveMelee with an active melee slice, after effect currentMeleeResolutionState is undefined', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    const melee = createMeleeResolutionState(withCards);
    const full: GameStateForBoard<StandardBoard> = updatePhaseState(
      withCards,
      createResolveMeleePhaseState(withCards, {
        currentMeleeResolutionState: melee,
      }),
    );

    const event: CompleteMeleeResolutionEvent = {
      effectType: 'completeMeleeResolution' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
    };

    const next = applyCompleteMeleeResolutionEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'resolveMelee') {
      throw new Error('melee phase');
    }
    expect(phase.currentMeleeResolutionState).toBe('pending');
  });
});
