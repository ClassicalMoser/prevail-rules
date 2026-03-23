import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateCompleteResolveMeleePhaseEvent } from './generateCompleteResolveMeleePhaseEvent';

describe('generateCompleteResolveMeleePhaseEvent', () => {
  it('returns a completeResolveMeleePhase game effect event', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    const event = generateCompleteResolveMeleePhaseEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeResolveMeleePhase');
  });

  it('returns the same payload regardless of state', () => {
    const a = generateCompleteResolveMeleePhaseEvent(createEmptyGameState());
    const b = generateCompleteResolveMeleePhaseEvent(createEmptyGameState());
    expect(a).toEqual(b);
  });
});
