import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateCompleteMeleeResolutionEvent } from './generateCompleteMeleeResolutionEvent';

describe('generateCompleteMeleeResolutionEvent', () => {
  it('returns a completeMeleeResolution game effect event', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    const event = generateCompleteMeleeResolutionEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeMeleeResolution');
  });

  it('returns the same payload regardless of state', () => {
    const a = generateCompleteMeleeResolutionEvent(createEmptyGameState());
    const b = generateCompleteMeleeResolutionEvent(createEmptyGameState());
    expect(a).toEqual(b);
  });
});
