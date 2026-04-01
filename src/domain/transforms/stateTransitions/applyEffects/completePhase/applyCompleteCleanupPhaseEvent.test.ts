import type { StandardBoard } from '@entities';
import type { CompleteCleanupPhaseEvent } from '@events';
import type { StandardGameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import {
  createCleanupPhaseState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState, updateRoundState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCompleteCleanupPhaseEvent } from './applyCompleteCleanupPhaseEvent';

/**
 * Round rollover: finishing cleanup bumps `roundNumber`, resets per-round bookkeeping
 * (`completedPhases`, `commandedUnits`), and starts the next round in `playCards.chooseCards`.
 * Trusted path can fire without a cleanup phase slice (mechanical advance).
 */
describe('applyCompleteCleanupPhaseEvent', () => {
  /** cleanup.complete with default empty game and black initiative. */
  function createGameStateInCleanupCompleteStep(): StandardGameState {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    return updatePhaseState(
      state,
      createCleanupPhaseState({ step: 'complete' }),
    );
  }

  const event: CompleteCleanupPhaseEvent<StandardBoard> = {
    eventNumber: 0,
    eventType: 'gameEffect',
    effectType: 'completeCleanupPhase',
  };

  describe('normal cleanup complete', () => {
    it('given cleanup.complete, next phase playCards and step chooseCards', () => {
      const state = createGameStateInCleanupCompleteStep();

      const newState = applyCompleteCleanupPhaseEvent(event, state);

      expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
        PLAY_CARDS_PHASE,
      );
      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'chooseCards',
      );
    });

    it('given cleanup.complete, currentRoundState.roundNumber and currentRoundNumber both increment', () => {
      const state = createGameStateInCleanupCompleteStep();
      const priorRound = state.currentRoundState.roundNumber;
      const priorCurrent = state.currentRoundNumber;

      const newState = applyCompleteCleanupPhaseEvent(event, state);

      expect(newState.currentRoundState.roundNumber).toBe(priorRound + 1);
      expect(newState.currentRoundNumber).toBe(priorRound + 1);
      expect(newState.currentRoundNumber).not.toBe(priorCurrent);
    });

    it('given seeded completedPhases and commandedUnits, next state clears both sets', () => {
      const base = createGameStateInCleanupCompleteStep();
      const unit = createTestUnit('black');
      const completedEntry = createPlayCardsPhaseState({ step: 'complete' });
      const state = updateRoundState(base, {
        ...base.currentRoundState,
        completedPhases: new Set([completedEntry]),
        commandedUnits: new Set([unit]),
      });

      const newState = applyCompleteCleanupPhaseEvent(event, state);

      expect(newState.currentRoundState.completedPhases.size).toBe(0);
      expect(newState.currentRoundState.commandedUnits.size).toBe(0);
    });
  });

  describe('structural update', () => {
    it('given phase and round before apply, input cleanup phase and round unchanged after apply', () => {
      const state = createGameStateInCleanupCompleteStep();
      const originalPhase = state.currentRoundState.currentPhaseState?.phase;
      const originalRound = state.currentRoundState.roundNumber;

      applyCompleteCleanupPhaseEvent(event, state);

      expect(state.currentRoundState.currentPhaseState?.phase).toBe(
        originalPhase,
      );
      expect(state.currentRoundState.roundNumber).toBe(originalRound);
    });
  });

  describe('trusted mechanical apply', () => {
    it('given issueCommands first step, still increments round and lands on playCards.chooseCards', () => {
      const base = createEmptyGameState();
      const state = updatePhaseState(
        base,
        createIssueCommandsPhaseState(base, {
          step: 'firstPlayerIssueCommands',
        }),
      );
      const priorRound = state.currentRoundState.roundNumber;

      const newState = applyCompleteCleanupPhaseEvent(event, state);

      expect(newState.currentRoundState.roundNumber).toBe(priorRound + 1);
      expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
        PLAY_CARDS_PHASE,
      );
    });

    it('given bare empty state without phase, still increments round and sets playCards.chooseCards', () => {
      const state = createEmptyGameState();
      const priorRound = state.currentRoundState.roundNumber;

      const newState = applyCompleteCleanupPhaseEvent(event, state);

      expect(newState.currentRoundState.roundNumber).toBe(priorRound + 1);
      expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
        PLAY_CARDS_PHASE,
      );
    });
  });
});
