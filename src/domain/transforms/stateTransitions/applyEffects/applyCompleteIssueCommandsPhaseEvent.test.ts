import type {
  GameState,
  IssueCommandsPhaseState,
  StandardBoard,
} from '@entities';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import { createGameStateWithEngagedUnits, createTestUnit } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCompleteIssueCommandsPhaseEvent } from './applyCompleteIssueCommandsPhaseEvent';

describe('applyCompleteIssueCommandsPhaseEvent', () => {
  /**
   * Helper to create a game state in the issueCommands phase, complete step
   * with engaged units on the board
   */
  function createGameStateInCompleteStep(): GameState<StandardBoard> {
    const blackUnit = createTestUnit('black', { attack: 3 });
    const whiteUnit = createTestUnit('white', { attack: 3 });
    const state = createGameStateWithEngagedUnits(blackUnit, whiteUnit, 'E-5');

    const initialPhaseState: IssueCommandsPhaseState<StandardBoard> = {
      phase: ISSUE_COMMANDS_PHASE,
      step: 'complete',
      remainingCommandsFirstPlayer: new Set(),
      remainingUnitsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set(),
      remainingUnitsSecondPlayer: new Set(),
      currentCommandResolutionState: undefined,
    };
    const stateWithPhase = updatePhaseState(state, initialPhaseState);

    return stateWithPhase;
  }

  describe('basic functionality', () => {
    it('should advance to resolveMelee phase with resolveMelee step', () => {
      const state = createGameStateInCompleteStep();

      const event: CompleteIssueCommandsPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
        engagements: new Set(['E-5']),
      };

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
        'resolveMelee',
      );
      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'resolveMelee',
      );
    });

    it('should add issueCommands phase to completed phases', () => {
      const state = createGameStateInCompleteStep();

      const event: CompleteIssueCommandsPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
        engagements: new Set(['E-5']),
      };

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      const completedPhases = Array.from(
        newState.currentRoundState.completedPhases,
      );
      expect(completedPhases).toHaveLength(1);
      expect(completedPhases[0]?.phase).toBe('issueCommands');
    });

    it('should set remaining engagements from event', () => {
      const state = createGameStateInCompleteStep();

      const event: CompleteIssueCommandsPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
        engagements: new Set(['E-5']),
      };

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'resolveMelee') {
        throw new Error('Expected resolveMelee phase');
      }

      expect(phaseState.remainingEngagements.has('E-5')).toBe(true);
    });

    it('should pass through multiple engagements from event', () => {
      const state = createGameStateInCompleteStep();

      const event: CompleteIssueCommandsPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
        engagements: new Set(['E-5', 'E-6']),
      };

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'resolveMelee') {
        throw new Error('Expected resolveMelee phase');
      }

      expect(phaseState.remainingEngagements.has('E-5')).toBe(true);
      expect(phaseState.remainingEngagements.has('E-6')).toBe(true);
      expect(phaseState.remainingEngagements.size).toBe(2);
    });

    it('should set currentMeleeResolutionState to undefined', () => {
      const state = createGameStateInCompleteStep();

      const event: CompleteIssueCommandsPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
        engagements: new Set(['E-5']),
      };

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'resolveMelee') {
        throw new Error('Expected resolveMelee phase');
      }

      expect(phaseState.currentMeleeResolutionState).toBeUndefined();
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createGameStateInCompleteStep();
      const originalPhase = state.currentRoundState.currentPhaseState?.phase;
      const originalCompletedPhasesSize =
        state.currentRoundState.completedPhases.size;

      const event: CompleteIssueCommandsPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
        engagements: new Set(['E-5']),
      };

      applyCompleteIssueCommandsPhaseEvent(event, state);

      expect(state.currentRoundState.currentPhaseState?.phase).toBe(
        originalPhase,
      );
      expect(state.currentRoundState.completedPhases.size).toBe(
        originalCompletedPhasesSize,
      );
    });
  });

  describe('error cases', () => {
    it('should throw if not on complete step', () => {
      const state = createGameStateInCompleteStep();
      const initialPhaseState: IssueCommandsPhaseState<StandardBoard> = {
        phase: ISSUE_COMMANDS_PHASE,
        step: 'firstPlayerIssueCommands',
        remainingCommandsFirstPlayer: new Set(),
        remainingUnitsFirstPlayer: new Set(),
        remainingCommandsSecondPlayer: new Set(),
        remainingUnitsSecondPlayer: new Set(),
        currentCommandResolutionState: undefined,
      };
      const stateWithWrongStep = updatePhaseState(state, initialPhaseState);

      const event: CompleteIssueCommandsPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
        engagements: new Set(['E-5']),
      };

      expect(() =>
        applyCompleteIssueCommandsPhaseEvent(event, stateWithWrongStep),
      ).toThrow('Issue commands phase is not on complete step');
    });
  });
});
