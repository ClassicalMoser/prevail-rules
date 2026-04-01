import type { StandardBoard } from '@entities';
import type { GameStateWithBoard, StandardGameState } from '@game';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateRevealCardsEvent } from './generateRevealCardsEvent';

/**
 * Reveal cards step: both players’ awaitingPlay cards become public knowledge.
 * The procedure only emits the effect tag — apply layer performs the reveal. Return value
 * is intentionally independent of `state` (see implementation); tests still pass any GameState.
 */
describe('generateRevealCardsEvent', () => {
  it('given any game state, emits gameEffect with effectType revealCards', () => {
    const state: StandardGameState = createEmptyGameState();
    const event = generateRevealCardsEvent(state, 0);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('revealCards');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateRevealCardsEvent(createEmptyGameState(), 0);
    const b = generateRevealCardsEvent(createEmptyGameState(), 0);
    expect(a).toEqual(b);
  });
});
