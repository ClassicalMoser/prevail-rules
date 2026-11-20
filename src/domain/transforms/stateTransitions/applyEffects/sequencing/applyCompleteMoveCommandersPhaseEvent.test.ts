import { tempCommandCards } from '@sampleValues';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import type { GameState } from '@game';
import { ISSUE_COMMANDS_PHASE, MOVE_COMMANDERS_PHASE } from '@game';

import { updateCardState } from '@testing';

import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfNone } from '@utils';

import { applyCompleteMoveCommandersPhaseEvent } from './applyCompleteMoveCommandersPhaseEvent';

import { createEmptyGameState } from '@factories';
/** The effect that ends Move Commanders; it carries nothing. */
function moveCommandersCompleteEvent(): CompleteMoveCommandersPhaseEvent {
  return {
    effectType: 'completeMoveCommandersPhase',
    eventType: 'gameEffect',
  };
}

/**
 * Commander placement done: `moveCommanders` is completed and issue commands
 * opens on the initiative player's issuing step. Each player's orders are the
 * command on their card in play, read when they issue. Phase guard requires
 * `moveCommanders`.
 */
describe('applyCompleteMoveCommandersPhaseEvent function', () => {
  /** MoveCommanders.complete, black initiative, tempCommandCards[0]/[1] inPlay. */
  function createGameStateInCompleteStep(): GameState {
    const state = createEmptyGameState('standard');

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

      const event = moveCommandersCompleteEvent();

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

      const event = moveCommandersCompleteEvent();

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const completedPhases = [...newState.currentRoundState.completedPhases];
      expect(completedPhases).toHaveLength(1);
      expect(completedPhases[0]?.phase).toBe('moveCommanders');
    });

    it('given default event, both remainingUnits* start empty', () => {
      const state = createGameStateInCompleteStep();

      const event = moveCommandersCompleteEvent();

      const newState = applyCompleteMoveCommandersPhaseEvent(event, state);

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingUnitsFirstPlayer).toHaveLength(0);
      expect(phaseState.remainingUnitsSecondPlayer).toHaveLength(0);
    });

    it('given default event, issueCommands has no currentCommandResolutionState', () => {
      const state = createGameStateInCompleteStep();

      const event = moveCommandersCompleteEvent();

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

      const event = moveCommandersCompleteEvent();

      applyCompleteMoveCommandersPhaseEvent(event, state);

      expect(
        throwIfNone(state.currentRoundState.currentPhaseState, 'phase').phase,
      ).toBe(originalPhase);
      expect(state.currentRoundState.completedPhases).toHaveLength(
        originalCompletedPhasesSize,
      );
    });
  });

  describe('trusted mechanical apply', () => {
    it('given moveFirstCommander step, still reaches issueCommands', () => {
      const state = createEmptyGameState('standard');
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

      const event = moveCommandersCompleteEvent();

      const newState = applyCompleteMoveCommandersPhaseEvent(
        event,
        stateWithWrongStep,
      );

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      expect(phaseState.phase).toBe('issueCommands');
    });
  });

  describe('phase guard', () => {
    it('given issueCommands phase, throws expected moveCommanders phase', () => {
      const state = createEmptyGameState('standard');
      const stateWrongPhase: GameState = updatePhaseState(state, {
        currentCommandResolutionState: 'pending',
        phase: ISSUE_COMMANDS_PHASE,
        remainingUnitsFirstPlayer: [],
        remainingUnitsSecondPlayer: [],
        step: 'firstPlayerIssueCommands',
      });

      const event = moveCommandersCompleteEvent();

      expect(() =>
        applyCompleteMoveCommandersPhaseEvent(event, stateWrongPhase),
      ).toThrow('Expected moveCommanders phase, got issueCommands');
    });
  });
});
