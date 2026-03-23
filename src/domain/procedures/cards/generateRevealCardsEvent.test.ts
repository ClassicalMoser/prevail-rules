import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateRevealCardsEvent } from './generateRevealCardsEvent';

describe('generateRevealCardsEvent', () => {
  it('returns a revealCards game effect event', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    const event = generateRevealCardsEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('revealCards');
  });

  it('returns the same payload regardless of state', () => {
    const a = generateRevealCardsEvent(createEmptyGameState());
    const b = generateRevealCardsEvent(createEmptyGameState());
    expect(a).toEqual(b);
  });
});
