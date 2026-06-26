import type { Command, StandardBoard } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import type { GameStateForBoard } from '@game';
import { ISSUE_COMMANDS_PHASE, MOVE_COMMANDERS_PHASE } from '@game';

import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, updateCardState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfNone } from '@utils';

import { applyCompleteMoveCommandersPhaseEvent } from './applyCompleteMoveCommandersPhaseEvent';

/** Matches procedure output for black initiative + tempCommandCards[0]/[1] in play. */
function moveCommandersCompleteEventFromDefaultCards(): CompleteMoveCommandersPhaseEvent {
  return {
    effectType: 'completeMoveCommandersPhase',
    eventNumber: 0,
    eventType: 'gameEffect',
    remainingCommandsFirstPlayer: [tempCommandCards[0].command],
    remainingCommandsSecondPlayer: [tempCommandCards[1].command],
  };
}

function moveCommandersCompleteEvent(
  first: Command[],
  second: Command[],
): CompleteMoveCommandersPhaseEvent {
  return {
    effectType: 'completeMoveCommandersPhase',
    eventNumber: 0,
    eventType: 'gameEffect',
    remainingCommandsFirstPlayer: first,
    remainingCommandsSecondPlayer: second,
  };
}

/**
 * Commander placement done: `moveCommanders` is completed and issue-commands opens with
 * `remainingCommands*` from the event (procedure-aligned with inPlay commands when using the
 * default factory event). Phase guard requires `moveCommanders`.
 */
describe(applyCompleteMoveCommandersPhaseEvent, () => {
  /** MoveCommanders.complete, black initiative, tempCommandCards[0]/[1] inPlay. */
  function createGameStateInCompleteStep(): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });

    const stateWithCards = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: tempCommandCards[0],
      },
      white: {
        ...state.cardState.white,
        inPlay: tempCommandCards[1],
      },
    });

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

      const phase = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      expect(phase.phase).toBe('issueCommands');
      expect(phase.step).toBe('firstPlayerIssueCommands');
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

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingCommandsFirstPlayer).toStrictEqual([
        blackCard.command,
      ]);
      expect(phaseState.remainingCommandsSecondPlayer).toStrictEqual([
        whiteCard.command,
      ]);
    });

    it('given default event, both remainingUnits* start empty', () => {
      const state = createGameStateInCompleteStep();

      const event = moveCommandersCompleteEventFromDefaultCards();

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingUnitsFirstPlayer.length).toBe(0);
      expect(phaseState.remainingUnitsSecondPlayer.length).toBe(0);
    });

    it('given default event, issueCommands has no currentCommandResolutionState', () => {
      const state = createGameStateInCompleteStep();

      const event = moveCommandersCompleteEventFromDefaultCards();

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.currentCommandResolutionState).toBe('pending');
    });
  });

  describe('structural update', () => {
    it('given phase and completedPhases size before apply, input moveCommanders slice unchanged', () => {
      const state = createGameStateInCompleteStep();
      const originalPhase = throwIfNone(
        state.currentRoundState.currentPhaseState,
        'phase',
      ).phase;
      const originalCompletedPhasesSize =
        state.currentRoundState.completedPhases.length;

      const event = moveCommandersCompleteEventFromDefaultCards();

      applyCompleteMoveCommandersPhaseEvent(event, state);

      expect(
        throwIfNone(state.currentRoundState.currentPhaseState, 'phase').phase,
      ).toBe(originalPhase);
      expect(state.currentRoundState.completedPhases.length).toBe(
        originalCompletedPhasesSize,
      );
    });
  });

  describe('trusted mechanical apply', () => {
    it('given moveFirstCommander step, still reaches issueCommands with same remaining commands', () => {
      const state = createEmptyGameState({ currentInitiative: 'black' });
      const stateWithCards = updateCardState(state, {
        ...state.cardState,
        black: {
          ...state.cardState.black,
          inPlay: tempCommandCards[0],
        },
        white: {
          ...state.cardState.white,
          inPlay: tempCommandCards[1],
        },
      });
      const stateWithWrongStep = updatePhaseState(stateWithCards, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'moveFirstCommander',
      });

      const event = moveCommandersCompleteEventFromDefaultCards();

      const newState = applyCompleteMoveCommandersPhaseEvent(
        event,
        stateWithWrongStep,
      );

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      expect(phaseState.phase).toBe('issueCommands');
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }
      expect(phaseState.remainingCommandsFirstPlayer).toStrictEqual([
        tempCommandCards[0].command,
      ]);
      expect(phaseState.remainingCommandsSecondPlayer).toStrictEqual([
        tempCommandCards[1].command,
      ]);
    });

    it('given inPlay null both sides and event empty command sets, issueCommands queues empty', () => {
      const state = createEmptyGameState({ currentInitiative: 'black' });
      const stateWithNoCards = updateCardState(state, {
        ...state.cardState,
        black: {
          ...state.cardState.black,
          inPlay: null,
        },
        white: {
          ...state.cardState.white,
          inPlay: null,
        },
      });
      const stateWithPhase = updatePhaseState(stateWithNoCards, {
        phase: MOVE_COMMANDERS_PHASE,
        step: 'complete',
      });

      const event = moveCommandersCompleteEvent([], []);

      const newState = applyCompleteMoveCommandersPhaseEvent(
        event,
        stateWithPhase,
      );

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }
      expect(phaseState.remainingCommandsFirstPlayer.length).toBe(0);
      expect(phaseState.remainingCommandsSecondPlayer.length).toBe(0);
    });

    it('given cards still inPlay but event passes empty sets, issueCommands ignores inPlay', () => {
      const state = createGameStateInCompleteStep();
      const event = moveCommandersCompleteEvent([], []);

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }
      expect(phaseState.remainingCommandsFirstPlayer.length).toBe(0);
      expect(phaseState.remainingCommandsSecondPlayer.length).toBe(0);
    });
  });

  describe('phase guard', () => {
    it('given issueCommands phase, throws expected moveCommanders phase', () => {
      const state = createEmptyGameState();
      const stateWrongPhase: GameStateForBoard<StandardBoard> =
        updatePhaseState(state, {
          boardType: 'standard',
          currentCommandResolutionState: 'pending',
          phase: ISSUE_COMMANDS_PHASE,
          remainingCommandsFirstPlayer: [],
          remainingCommandsSecondPlayer: [],
          remainingUnitsFirstPlayer: [],
          remainingUnitsSecondPlayer: [],
          step: 'firstPlayerIssueCommands',
        });

      const event = moveCommandersCompleteEventFromDefaultCards();

      expect(() =>
        applyCompleteMoveCommandersPhaseEvent(event, stateWrongPhase),
      ).toThrow('Expected moveCommanders phase, got issueCommands');
    });
  });
});
