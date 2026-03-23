import type { GameState, StandardBoard } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateCompleteUnitMovementEvent } from './generateCompleteUnitMovementEvent';

describe('generateCompleteUnitMovementEvent', () => {
  it('returns a completeUnitMovement game effect event', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    const event = generateCompleteUnitMovementEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeUnitMovement');
  });

  it('returns the same payload regardless of state', () => {
    const a = generateCompleteUnitMovementEvent(createEmptyGameState());
    const b = generateCompleteUnitMovementEvent(createEmptyGameState());
    expect(a).toEqual(b);
  });
});
