import type { GameState } from '@game';

import { generateCardsLeavePlayEvent } from './generateCardsLeavePlayEvent';

import { createEmptyGameState } from '@factories';
/**
 * Cleanup phase entry: signal to discard all played command cards from both sides.
 * Payload is a fixed game effect only; handler clears played piles. Implementation ignores
 * `state` beyond the parameter shape — tests document that contract.
 */
describe('generateCardsLeavePlayEvent function', () => {
  it('given any game state, emits gameEffect with effectType cardsLeavePlay', () => {
    const state: GameState = createEmptyGameState('standard');
    const event = generateCardsLeavePlayEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('cardsLeavePlay');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateCardsLeavePlayEvent(createEmptyGameState('standard'));
    const b = generateCardsLeavePlayEvent(createEmptyGameState('standard'));
    expect(a).toStrictEqual(b);
  });
});
