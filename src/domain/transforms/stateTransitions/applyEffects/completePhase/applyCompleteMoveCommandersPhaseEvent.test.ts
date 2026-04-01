import type { Command, StandardBoard } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import type { StandardGameState } from '@game';
import { ISSUE_COMMANDS_PHASE, MOVE_COMMANDERS_PHASE } from '@game';

import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCompleteMoveCommandersPhaseEvent } from './applyCompleteMoveCommandersPhaseEvent';

/** Matches procedure output for black initiative + tempCommandCards[0]/[1] in play. */
function moveCommandersCompleteEventFromDefaultCards(): CompleteMoveCommandersPhaseEvent<StandardBoard> {
  return {
    eventNumber: 0,
    eventType: 'gameEffect',
    effectType: 'completeMoveCommandersPhase',
    remainingCommandsFirstPlayer: new Set([tempCommandCards[0].command]),
    remainingCommandsSecondPlayer: new Set([tempCommandCards[1].command]),
  };
}

function moveCommandersCompleteEvent(
  first: Set<Command>,
  second: Set<Command>,
): CompleteMoveCommandersPhaseEvent<StandardBoard> {
  return {
    eventNumber: 0,
    eventType: 'gameEffect',
    effectType: 'completeMoveCommandersPhase',
    remainingCommandsFirstPlayer: first,
    remainingCommandsSecondPlayer: second,
  };
}

/**
 * Commander placement done: `moveCommanders` is completed and issue-commands opens with
 * `remainingCommands*` from the event (procedure-aligned with inPlay commands when using the
 * default factory event). Phase guard requires `moveCommanders`.
 */
describe('applyCompleteMoveCommandersPhaseEvent', () => {
  /** moveCommanders.complete, black initiative, tempCommandCards[0]/[1] inPlay. */
  function createGameStateInCompleteStep(): StandardGameState {
    const state = createEmptyGameState({ currentInitiative: 'black' });

    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        inPlay: tempCommandCards[0],
      },
      white: {
        ...current.white,
        inPlay: tempCommandCards[1],
      },
    }));

    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    return stateWithPhase;
  }

  describe('default procedure-shaped event', () => {
    it('given moveCommanders complete and default remaining commands, issueCommands.firstPlayerIssueCommands', () => {
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

    it('given same handoff, completedPhases records moveCommanders', () => {
      const state = createGameStateInCompleteStep();

      const event = moveCommandersCompleteEventFromDefaultCards();

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const completedPhases = [...newState.currentRoundState.completedPhases];
      expect(completedPhases).toHaveLength(1);
      expect(completedPhases[0]?.phase).toBe('moveCommanders');
    });

    it('given default event, issueCommands remaining command sets mirror inPlay card commands', () => {
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

    it('given default event, both remainingUnits* start empty', () => {
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

    it('given default event, issueCommands has no currentCommandResolutionState', () => {
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

  describe('structural update', () => {
    it('given phase and completedPhases size before apply, input moveCommanders slice unchanged', () => {
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

  describe('trusted mechanical apply', () => {
    it('given moveFirstCommander step, still reaches issueCommands with same remaining commands', () => {
      const state = createEmptyGameState({ currentInitiative: 'black' });
      const stateWithCards = updateCardState(state, (current) => ({
        ...current,
        black: {
          ...current.black,
          inPlay: tempCommandCards[0],
        },
        white: {
          ...current.white,
          inPlay: tempCommandCards[1],
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
        new Set([tempCommandCards[0].command]),
      );
      expect(phaseState.remainingCommandsSecondPlayer).toEqual(
        new Set([tempCommandCards[1].command]),
      );
    });

    it('given inPlay null both sides and event empty command sets, issueCommands queues empty', () => {
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

    it('given cards still inPlay but event passes empty sets, issueCommands ignores inPlay', () => {
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

  describe('phase guard', () => {
    it('given issueCommands phase, throws expected moveCommanders phase', () => {
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
