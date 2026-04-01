import type { StandardGameState } from '@game';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateCompleteRangedAttackCommandEvent } from './generateCompleteRangedAttackCommandEvent';

/**
 * Completes the ranged-attack command resolution sub-flow (after apply chain finishes).
 * Fixed `completeRangedAttackCommand` game effect; implementation does not read `state`.
 */
describe('generateCompleteRangedAttackCommandEvent', () => {
  it('given any game state, emits gameEffect with effectType completeRangedAttackCommand', () => {
    const state: StandardGameState = createEmptyGameState();
    const event = generateCompleteRangedAttackCommandEvent(state, 0);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeRangedAttackCommand');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateCompleteRangedAttackCommandEvent(
      createEmptyGameState(),
      0,
    );
    const b = generateCompleteRangedAttackCommandEvent(
      createEmptyGameState(),
      0,
    );
    expect(a).toEqual(b);
  });
});
