import type { GameState, StandardBoard } from '@entities';
import type { CompleteCleanupPhaseEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@entities';
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

describe('applyCompleteCleanupPhaseEvent', () => {
  function createGameStateInCleanupCompleteStep(): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    return updatePhaseState(
      state,
      createCleanupPhaseState({ step: 'complete' }),
    );
  }

  const event: CompleteCleanupPhaseEvent<StandardBoard> = {
    eventType: 'gameEffect',
    effectType: 'completeCleanupPhase',
  };

  describe('basic functionality', () => {
    it('should advance to playCards phase with chooseCards step', () => {
      const state = createGameStateInCleanupCompleteStep();

      const newState = applyCompleteCleanupPhaseEvent(event, state);

      expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
        PLAY_CARDS_PHASE,
      );
      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'chooseCards',
      );
    });

    it('should increment round number on round state and top-level currentRoundNumber', () => {
      const state = createGameStateInCleanupCompleteStep();
      const priorRound = state.currentRoundState.roundNumber;
      const priorCurrent = state.currentRoundNumber;

      const newState = applyCompleteCleanupPhaseEvent(event, state);

      expect(newState.currentRoundState.roundNumber).toBe(priorRound + 1);
      expect(newState.currentRoundNumber).toBe(priorRound + 1);
      expect(newState.currentRoundNumber).not.toBe(priorCurrent);
    });

    it('should reset completed phases and commanded units for the new round', () => {
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

  describe('immutability', () => {
    it('should not mutate the original state', () => {
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

  describe('trusted event (mechanical apply)', () => {
    it('should advance round from a non-cleanup phase without validating phase', () => {
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

    it('should apply when there is no current phase state', () => {
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
