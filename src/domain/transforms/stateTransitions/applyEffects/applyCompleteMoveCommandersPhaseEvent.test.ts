import type { GameState, StandardBoard } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import { MOVE_COMMANDERS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCompleteMoveCommandersPhaseEvent } from './applyCompleteMoveCommandersPhaseEvent';

describe('applyCompleteMoveCommandersPhaseEvent', () => {
  /**
   * Helper to create a game state in the moveCommanders phase, complete step
   * with cards in play for both players
   */
  function createGameStateInCompleteStep(): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });

    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        inPlay: commandCards[0],
      },
      white: {
        ...current.white,
        inPlay: commandCards[1],
      },
    }));

    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    return stateWithPhase;
  }

  describe('basic functionality', () => {
    it('should advance to issueCommands phase with firstPlayerIssueCommands step', () => {
      const state = createGameStateInCompleteStep();
      const blackCard = commandCards[0]!;
      const whiteCard = commandCards[1]!;

      const event: CompleteMoveCommandersPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
        firstPlayerCommands: new Set([blackCard.command]),
        secondPlayerCommands: new Set([whiteCard.command]),
      };

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
        'issueCommands',
      );
      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'firstPlayerIssueCommands',
      );
    });

    it('should add moveCommanders phase to completed phases', () => {
      const state = createGameStateInCompleteStep();
      const blackCard = commandCards[0]!;
      const whiteCard = commandCards[1]!;

      const event: CompleteMoveCommandersPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
        firstPlayerCommands: new Set([blackCard.command]),
        secondPlayerCommands: new Set([whiteCard.command]),
      };

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const completedPhases = Array.from(
        newState.currentRoundState.completedPhases,
      );
      expect(completedPhases).toHaveLength(1);
      expect(completedPhases[0]?.phase).toBe('moveCommanders');
    });

    it('should set remaining commands from event', () => {
      const state = createGameStateInCompleteStep();
      const blackCard = commandCards[0]!;
      const whiteCard = commandCards[1]!;

      const event: CompleteMoveCommandersPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
        firstPlayerCommands: new Set([blackCard.command]),
        secondPlayerCommands: new Set([whiteCard.command]),
      };

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingCommandsFirstPlayer).toEqual(
        new Set([blackCard.command]),
      );
      expect(phaseState.remainingCommandsSecondPlayer).toEqual(
        new Set([whiteCard.command]),
      );
    });

    it('should initialize remaining units as empty sets', () => {
      const state = createGameStateInCompleteStep();
      const blackCard = commandCards[0]!;
      const whiteCard = commandCards[1]!;

      const event: CompleteMoveCommandersPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
        firstPlayerCommands: new Set([blackCard.command]),
        secondPlayerCommands: new Set([whiteCard.command]),
      };

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingUnitsFirstPlayer.size).toBe(0);
      expect(phaseState.remainingUnitsSecondPlayer.size).toBe(0);
    });

    it('should set currentCommandResolutionState to undefined', () => {
      const state = createGameStateInCompleteStep();
      const blackCard = commandCards[0]!;
      const whiteCard = commandCards[1]!;

      const event: CompleteMoveCommandersPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
        firstPlayerCommands: new Set([blackCard.command]),
        secondPlayerCommands: new Set([whiteCard.command]),
      };

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.currentCommandResolutionState).toBeUndefined();
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createGameStateInCompleteStep();
      const originalPhase = state.currentRoundState.currentPhaseState?.phase;
      const originalCompletedPhasesSize =
        state.currentRoundState.completedPhases.size;
      const blackCard = commandCards[0]!;
      const whiteCard = commandCards[1]!;

      const event: CompleteMoveCommandersPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
        firstPlayerCommands: new Set([blackCard.command]),
        secondPlayerCommands: new Set([whiteCard.command]),
      };

      applyCompleteMoveCommandersPhaseEvent(event, state);

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
      const state = createEmptyGameState({ currentInitiative: 'black' });
      const stateWithCards = updateCardState(state, (current) => ({
        ...current,
        black: {
          ...current.black,
          inPlay: commandCards[0],
        },
        white: {
          ...current.white,
          inPlay: commandCards[1],
        },
      }));
      const stateWithWrongStep = updatePhaseState(stateWithCards, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'moveFirstCommander',
      });
      const blackCard = commandCards[0]!;
      const whiteCard = commandCards[1]!;

      const event: CompleteMoveCommandersPhaseEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeMoveCommandersPhase',
        firstPlayerCommands: new Set([blackCard.command]),
        secondPlayerCommands: new Set([whiteCard.command]),
      };

      expect(() =>
        applyCompleteMoveCommandersPhaseEvent(event, stateWithWrongStep),
      ).toThrow('Move commanders phase is not on complete step');
    });
  });
});
