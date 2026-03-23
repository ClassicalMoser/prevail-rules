import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateCompleteCleanupPhaseEvent } from './generateCompleteCleanupPhaseEvent';

describe('generateCompleteCleanupPhaseEvent', () => {
  it('returns a completeCleanupPhase game effect event', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    const event = generateCompleteCleanupPhaseEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeCleanupPhase');
  });

  it('returns the same payload regardless of state', () => {
    const a = generateCompleteCleanupPhaseEvent(createEmptyGameState());
    const b = generateCompleteCleanupPhaseEvent(createEmptyGameState());
    expect(a).toEqual(b);
  });
});
