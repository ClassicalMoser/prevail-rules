import type { StandardGameState } from '@game';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { generateCompleteUnitMovementEvent } from './generateCompleteUnitMovementEvent';

/**
 * Signals that the active unit’s movement command is fully resolved on the board.
 * Fixed `completeUnitMovement` effect only; apply layer finalizes movement bookkeeping.
 * Generator does not inspect board or phase beyond accepting GameState.
 */
describe('generateCompleteUnitMovementEvent', () => {
  it('given any game state, emits gameEffect with effectType completeUnitMovement', () => {
    const state: StandardGameState = createEmptyGameState();
    const event = generateCompleteUnitMovementEvent(state, 0);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeUnitMovement');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateCompleteUnitMovementEvent(createEmptyGameState(), 0);
    const b = generateCompleteUnitMovementEvent(createEmptyGameState(), 0);
    expect(a).toEqual(b);
  });
});
