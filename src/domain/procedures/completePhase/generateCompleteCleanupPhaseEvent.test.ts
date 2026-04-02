import type { StandardBoard } from '@entities';
import type { GameStateWithBoard, StandardGameState } from '@game';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateCompleteCleanupPhaseEvent } from './generateCompleteCleanupPhaseEvent';

/**
 * End of cleanup: advance round and return to play-cards phase. Emitted event is a fixed
 * `completeCleanupPhase` tag only — round/phase mutation happens in apply. Deliberately
 * does not branch on current `state` in the generator.
 */
describe('generateCompleteCleanupPhaseEvent', () => {
  it('given any game state, emits gameEffect with effectType completeCleanupPhase', () => {
    const state: StandardGameState = createEmptyGameState();
    const event = generateCompleteCleanupPhaseEvent(state, 0);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeCleanupPhase');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateCompleteCleanupPhaseEvent(createEmptyGameState(), 0);
    const b = generateCompleteCleanupPhaseEvent(createEmptyGameState(), 0);
    expect(a).toEqual(b);
  });
});
