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

/**
 * After both sides have played cards, this effect closes the play-cards phase. The generator
 * returns a constant payload only — it does not read initiative, round, or card fields.
 */
describe('generateCompletePlayCardsPhaseEvent', () => {
  /** Minimal valid snapshot: PLAY_CARDS_PHASE + step `complete` (other fields default). */
  function createGameStateInCompleteStep(): GameState<StandardBoard> {
    const state = createEmptyGameState();

    const stateWithPhase = updatePhaseState(state, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });

    return stateWithPhase;
  }

  describe('state-independent payload', () => {
    const expectedEvent = {
      eventNumber: 0,
      eventType: GAME_EFFECT_EVENT_TYPE,
      effectType: COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
    };

    it('given playCards complete step, emits literal completePlayCardsPhase effect', () => {
      const state = createGameStateInCompleteStep();

      expect(generateCompletePlayCardsPhaseEvent(state, 0)).toEqual(
        expectedEvent,
      );
    });

    it('given different initiative, round counters, or same phase shape, still emits identical effect', () => {
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

      expect(generateCompletePlayCardsPhaseEvent(stateBlackInit, 0)).toEqual(
        expectedEvent,
      );
      expect(generateCompletePlayCardsPhaseEvent(stateWhiteInit, 0)).toEqual(
        expectedEvent,
      );
      expect(
        generateCompletePlayCardsPhaseEvent(stateDifferentRound, 0),
      ).toEqual(expectedEvent);
    });
  });
});
