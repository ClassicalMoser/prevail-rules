import type { Command, GameState, StandardBoard } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import { ISSUE_COMMANDS_PHASE, MOVE_COMMANDERS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCompleteMoveCommandersPhaseEvent } from './applyCompleteMoveCommandersPhaseEvent';

/** Matches procedure output for black initiative + commandCards[0]/[1] in play. */
function moveCommandersCompleteEventFromDefaultCards(): CompleteMoveCommandersPhaseEvent<StandardBoard> {
  return {
    eventType: 'gameEffect',
    effectType: 'completeMoveCommandersPhase',
    remainingCommandsFirstPlayer: new Set([commandCards[0].command]),
    remainingCommandsSecondPlayer: new Set([commandCards[1].command]),
  };
}

function moveCommandersCompleteEvent(
  first: Set<Command>,
  second: Set<Command>,
): CompleteMoveCommandersPhaseEvent<StandardBoard> {
  return {
    eventType: 'gameEffect',
    effectType: 'completeMoveCommandersPhase',
    remainingCommandsFirstPlayer: first,
    remainingCommandsSecondPlayer: second,
  };
}

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

      const event = moveCommandersCompleteEventFromDefaultCards();

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

      const event = moveCommandersCompleteEventFromDefaultCards();

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const completedPhases = [...newState.currentRoundState.completedPhases];
      expect(completedPhases).toHaveLength(1);
      expect(completedPhases[0]?.phase).toBe('moveCommanders');
    });

    it('should set remaining commands from cards in play', () => {
      const state = createGameStateInCompleteStep();
      const blackCard = state.cardState.black.inPlay;
      const whiteCard = state.cardState.white.inPlay;

      if (!blackCard || !whiteCard) {
        throw new Error('Expected cards to be in play');
      }

      const event = moveCommandersCompleteEventFromDefaultCards();

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

      const event = moveCommandersCompleteEventFromDefaultCards();

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

      const event = moveCommandersCompleteEventFromDefaultCards();

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

      const event = moveCommandersCompleteEventFromDefaultCards();

      applyCompleteMoveCommandersPhaseEvent(event, state);

      expect(state.currentRoundState.currentPhaseState?.phase).toBe(
        originalPhase,
      );
      expect(state.currentRoundState.completedPhases.size).toBe(
        originalCompletedPhasesSize,
      );
    });
  });

  describe('trusted event (mechanical apply)', () => {
    it('should advance when moveCommanders step is not complete', () => {
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

      const event = moveCommandersCompleteEventFromDefaultCards();

      const newState = applyCompleteMoveCommandersPhaseEvent(
        event,
        stateWithWrongStep,
      );

      expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
        'issueCommands',
      );
      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }
      expect(phaseState.remainingCommandsFirstPlayer).toEqual(
        new Set([commandCards[0].command]),
      );
      expect(phaseState.remainingCommandsSecondPlayer).toEqual(
        new Set([commandCards[1].command]),
      );
    });

    it('should use empty command sets when inPlay cards are missing', () => {
      const state = createEmptyGameState({ currentInitiative: 'black' });
      const stateWithNoCards = updateCardState(state, (current) => ({
        ...current,
        black: {
          ...current.black,
          inPlay: null,
        },
        white: {
          ...current.white,
          inPlay: null,
        },
      }));
      const stateWithPhase = updatePhaseState(stateWithNoCards, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'complete',
      });

      const event = moveCommandersCompleteEvent(new Set(), new Set());

      const newState = applyCompleteMoveCommandersPhaseEvent(
        event,
        stateWithPhase,
      );

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }
      expect(phaseState.remainingCommandsFirstPlayer.size).toBe(0);
      expect(phaseState.remainingCommandsSecondPlayer.size).toBe(0);
    });

    it('should use command sets from the event, not from card state', () => {
      const state = createGameStateInCompleteStep();
      const event = moveCommandersCompleteEvent(new Set(), new Set());

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }
      expect(phaseState.remainingCommandsFirstPlayer.size).toBe(0);
      expect(phaseState.remainingCommandsSecondPlayer.size).toBe(0);
    });
  });

  describe('phase type guard', () => {
    it('should throw if not in moveCommanders phase', () => {
      const state = createEmptyGameState();
      const stateWrongPhase = updatePhaseState(state, {
        phase: ISSUE_COMMANDS_PHASE,
        step: 'firstPlayerIssueCommands',
        remainingCommandsFirstPlayer: new Set(),
        remainingCommandsSecondPlayer: new Set(),
        remainingUnitsFirstPlayer: new Set(),
        remainingUnitsSecondPlayer: new Set(),
        currentCommandResolutionState: undefined,
      });

      const event = moveCommandersCompleteEventFromDefaultCards();

      expect(() =>
        applyCompleteMoveCommandersPhaseEvent(event, stateWrongPhase),
      ).toThrow('Expected moveCommanders phase, got issueCommands');
    });
  });
});
