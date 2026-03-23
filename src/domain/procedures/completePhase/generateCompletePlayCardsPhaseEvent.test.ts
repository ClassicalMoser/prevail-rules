import type { GameState, StandardBoard } from '@entities';
import { PLAY_CARDS_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateCompletePlayCardsPhaseEvent } from './generateCompletePlayCardsPhaseEvent';

describe('generateCompletePlayCardsPhaseEvent', () => {
  /**
   * Helper to create a game state in the playCards phase, complete step
   */
  function createGameStateInCompleteStep(): GameState<StandardBoard> {
    const state = createEmptyGameState();

    const stateWithPhase = updatePhaseState(state, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });

    return stateWithPhase;
  }

  describe('basic functionality', () => {
    it('should return a completePlayCardsPhase event', () => {
      const state = createGameStateInCompleteStep();

      const event = generateCompletePlayCardsPhaseEvent(state);

      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe('completePlayCardsPhase');
    });

    it('should return the same event regardless of state', () => {
      const state1 = createGameStateInCompleteStep();
      const state2 = createGameStateInCompleteStep();

      const event1 = generateCompletePlayCardsPhaseEvent(state1);
      const event2 = generateCompletePlayCardsPhaseEvent(state2);

      expect(event1).toEqual(event2);
    });
  });
});
