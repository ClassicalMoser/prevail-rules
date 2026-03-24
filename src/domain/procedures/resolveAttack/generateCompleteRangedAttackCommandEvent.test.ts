import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateCompleteRangedAttackCommandEvent } from './generateCompleteRangedAttackCommandEvent';

/**
 * Completes the ranged-attack command resolution sub-flow (after apply chain finishes).
 * Fixed `completeRangedAttackCommand` game effect; implementation does not read `state`.
 */
describe('generateCompleteRangedAttackCommandEvent', () => {
  it('given any game state, emits gameEffect with effectType completeRangedAttackCommand', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    const event = generateCompleteRangedAttackCommandEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeRangedAttackCommand');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateCompleteRangedAttackCommandEvent(createEmptyGameState());
    const b = generateCompleteRangedAttackCommandEvent(createEmptyGameState());
    expect(a).toEqual(b);
  });
});
