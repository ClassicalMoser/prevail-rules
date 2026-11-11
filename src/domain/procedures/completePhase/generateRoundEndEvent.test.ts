import type { GameState } from '@game';

import { generateRoundEndEvent } from './generateRoundEndEvent';

import { createEmptyGameState } from '@factories';
/**
 * End of cleanup: advance round and return to play-cards phase. Emitted event is a fixed
 * `roundEnd` tag only — round/phase mutation happens in apply. Deliberately
 * does not branch on current `state` in the generator.
 */
describe('generateRoundEndEvent function', () => {
  it('given any game state, emits gameEffect with effectType roundEnd', () => {
    const state: GameState = createEmptyGameState('standard');
    const event = generateRoundEndEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('roundEnd');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateRoundEndEvent(createEmptyGameState('standard'));
    const b = generateRoundEndEvent(createEmptyGameState('standard'));
    expect(a).toStrictEqual(b);
  });
});
