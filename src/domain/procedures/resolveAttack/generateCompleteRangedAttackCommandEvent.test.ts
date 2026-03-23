import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateCompleteRangedAttackCommandEvent } from './generateCompleteRangedAttackCommandEvent';

describe('generateCompleteRangedAttackCommandEvent', () => {
  it('returns a completeRangedAttackCommand game effect event', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    const event = generateCompleteRangedAttackCommandEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeRangedAttackCommand');
  });

  it('returns the same payload regardless of state', () => {
    const a = generateCompleteRangedAttackCommandEvent(createEmptyGameState());
    const b = generateCompleteRangedAttackCommandEvent(createEmptyGameState());
    expect(a).toEqual(b);
  });
});
