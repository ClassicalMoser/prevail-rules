import type { GameState } from '@game';

import { generateCompleteCleanupPhaseEvent } from './generateCompleteCleanupPhaseEvent';

import { createEmptyGameState } from '@factories';
/**
 * End of cleanup: advance round and return to play-cards phase. Emitted event is a fixed
 * `completeCleanupPhase` tag only — round/phase mutation happens in apply. Deliberately
 * does not branch on current `state` in the generator.
 */
describe(generateCompleteCleanupPhaseEvent, () => {
  it('given any game state, emits gameEffect with effectType completeCleanupPhase', () => {
    const state: GameState = createEmptyGameState('standard');
    const event = generateCompleteCleanupPhaseEvent(state, 0);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeCleanupPhase');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateCompleteCleanupPhaseEvent(
      createEmptyGameState('standard'),
      0,
    );
    const b = generateCompleteCleanupPhaseEvent(
      createEmptyGameState('standard'),
      0,
    );
    expect(a).toStrictEqual(b);
  });
});
