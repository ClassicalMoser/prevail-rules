import type { GameState, StandardBoard } from '@entities';
import { PLAY_CARDS_PHASE } from '@entities';
import {
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
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
    const expectedEvent = {
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
    };

    it('returns a fixed completePlayCardsPhase game effect', () => {
      const state = createGameStateInCompleteStep();

      expect(generateCompletePlayCardsPhaseEvent(state)).toEqual(expectedEvent);
    });

    it('returns the same event for meaningfully different game states', () => {
      const base = createEmptyGameState();
      const stateBlackInit = createGameStateInCompleteStep();
      const stateWhiteInit = updatePhaseState(
        createEmptyGameState({ currentInitiative: 'white' }),
        {
          phase: PLAY_CARDS_PHASE,
          step: 'complete',
        },
      );
      const stateDifferentRound = {
        ...createGameStateInCompleteStep(),
        currentRoundNumber: 99,
        currentRoundState: {
          ...base.currentRoundState,
          roundNumber: 100,
        },
      } satisfies GameState<StandardBoard>;

      expect(generateCompletePlayCardsPhaseEvent(stateBlackInit)).toEqual(
        expectedEvent,
      );
      expect(generateCompletePlayCardsPhaseEvent(stateWhiteInit)).toEqual(
        expectedEvent,
      );
      expect(generateCompletePlayCardsPhaseEvent(stateDifferentRound)).toEqual(
        expectedEvent,
      );
    });
  });
});
