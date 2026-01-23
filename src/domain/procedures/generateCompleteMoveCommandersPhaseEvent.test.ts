import type { GameState, StandardBoard } from '@entities';
import { MOVE_COMMANDERS_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateCompleteMoveCommandersPhaseEvent } from './generateCompleteMoveCommandersPhaseEvent';

describe('generateCompleteMoveCommandersPhaseEvent', () => {
  /**
   * Helper to create a game state in the moveCommanders phase, complete step
   */
  function createGameStateInCompleteStep(): GameState<StandardBoard> {
    const state = createEmptyGameState();

    const stateWithPhase = updatePhaseState(state, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    return stateWithPhase;
  }

  describe('basic functionality', () => {
    it('should return a completeMoveCommandersPhase event', () => {
      const state = createGameStateInCompleteStep();

      const event = generateCompleteMoveCommandersPhaseEvent(state);

      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe('completeMoveCommandersPhase');
    });

    it('should return the same event regardless of state', () => {
      const state1 = createGameStateInCompleteStep();
      const state2 = createGameStateInCompleteStep();

      const event1 = generateCompleteMoveCommandersPhaseEvent(state1);
      const event2 = generateCompleteMoveCommandersPhaseEvent(state2);

      expect(event1).toEqual(event2);
    });
  });
});
