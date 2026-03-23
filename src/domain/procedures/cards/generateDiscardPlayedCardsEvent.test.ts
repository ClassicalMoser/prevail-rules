import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateDiscardPlayedCardsEvent } from './generateDiscardPlayedCardsEvent';

describe('generateDiscardPlayedCardsEvent', () => {
  it('returns a discardPlayedCards game effect event', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    const event = generateDiscardPlayedCardsEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('discardPlayedCards');
  });

  it('returns the same payload regardless of state', () => {
    const a = generateDiscardPlayedCardsEvent(createEmptyGameState());
    const b = generateDiscardPlayedCardsEvent(createEmptyGameState());
    expect(a).toEqual(b);
  });
});
