import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateDiscardPlayedCardsEvent } from './generateDiscardPlayedCardsEvent';

/**
 * Cleanup phase entry: signal to discard all played command cards from both sides.
 * Payload is a fixed game effect only; handler clears played piles. Implementation ignores
 * `state` beyond the parameter shape — tests document that contract.
 */
describe('generateDiscardPlayedCardsEvent', () => {
  it('given any game state, emits gameEffect with effectType discardPlayedCards', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    const event = generateDiscardPlayedCardsEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('discardPlayedCards');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateDiscardPlayedCardsEvent(createEmptyGameState());
    const b = generateDiscardPlayedCardsEvent(createEmptyGameState());
    expect(a).toEqual(b);
  });
});
