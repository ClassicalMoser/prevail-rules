import type {
  BoardCoordinate,
  GameState,
  IssueCommandsPhaseState,
  StandardBoard,
} from '@entities';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import {
  createGameStateWithEngagedUnits,
  createIssueCommandsPhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCompleteIssueCommandsPhaseEvent } from './applyCompleteIssueCommandsPhaseEvent';

function issueCommandsCompleteEvent(
  remainingEngagements: Set<BoardCoordinate<StandardBoard>>,
): CompleteIssueCommandsPhaseEvent<StandardBoard> {
  return {
    eventNumber: 0,
    eventType: 'gameEffect',
    effectType: 'completeIssueCommandsPhase',
    remainingEngagements,
  };
}

/**
 * End of issuing: transitions to `resolveMelee` with `remainingEngagements` taken from the
 * event (trusted list—empty set means no melees queued even if board still shows engagement).
 */
describe('applyCompleteIssueCommandsPhaseEvent', () => {
  /** issueCommands.complete with E-5 engaged pair from factory and empty command queues. */
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

  describe('phase handoff', () => {
    it('given event remaining E-5, next phase resolveMelee and step resolveMelee', () => {
      const state = createGameStateInCompleteStep();

      const event = issueCommandsCompleteEvent(new Set(['E-5']));

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
        'resolveMelee',
      );
      expect(newState.currentRoundState.currentPhaseState?.step).toBe(
        'resolveMelee',
      );
    });

    it('given same transition, completedPhases gains one issueCommands entry', () => {
      const state = createGameStateInCompleteStep();

      const event = issueCommandsCompleteEvent(new Set(['E-5']));

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      const completedPhases = [...newState.currentRoundState.completedPhases];
      expect(completedPhases).toHaveLength(1);
      expect(completedPhases[0]?.phase).toBe('issueCommands');
    });

    it('given event Set with E-5, resolveMelee.remainingEngagements contains E-5', () => {
      const state = createGameStateInCompleteStep();

      const event = issueCommandsCompleteEvent(new Set(['E-5']));

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'resolveMelee') {
        throw new Error('Expected resolveMelee phase');
      }

      expect(phaseState.remainingEngagements.has('E-5')).toBe(true);
    });

    it('given event lists E-5 and E-6 after second engagement hacked onto board, set has both', () => {
      const blackUnit1 = createTestUnit('black', { attack: 3 });
      const whiteUnit1 = createTestUnit('white', { attack: 3 });
      const state = createGameStateWithEngagedUnits(
        blackUnit1,
        whiteUnit1,
        'E-5',
      );

      const blackUnit2 = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      const whiteUnit2 = createTestUnit('white', {
        attack: 3,
        instanceNumber: 2,
      });
      state.boardState.board['E-6'] = {
        ...state.boardState.board['E-6']!,
        unitPresence: {
          presenceType: 'engaged',
          primaryUnit: blackUnit2,
          primaryFacing: 'north',
          secondaryUnit: whiteUnit2,
        },
      };

      const stateWithPhase = updatePhaseState(state, {
        phase: ISSUE_COMMANDS_PHASE,
        step: 'complete',
        remainingCommandsFirstPlayer: new Set(),
        remainingUnitsFirstPlayer: new Set(),
        remainingCommandsSecondPlayer: new Set(),
        remainingUnitsSecondPlayer: new Set(),
        currentCommandResolutionState: undefined,
      });

      const event = issueCommandsCompleteEvent(new Set(['E-5', 'E-6']));

      const newState = applyCompleteIssueCommandsPhaseEvent(
        event,
        stateWithPhase,
      );

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'resolveMelee') {
        throw new Error('Expected resolveMelee phase');
      }

      expect(phaseState.remainingEngagements.has('E-5')).toBe(true);
      expect(phaseState.remainingEngagements.has('E-6')).toBe(true);
      expect(phaseState.remainingEngagements.size).toBe(2);
    });

    it('given standard handoff, new resolveMelee slice has no currentMeleeResolutionState', () => {
      const state = createGameStateInCompleteStep();

      const event = issueCommandsCompleteEvent(new Set(['E-5']));

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'resolveMelee') {
        throw new Error('Expected resolveMelee phase');
      }

      expect(phaseState.currentMeleeResolutionState).toBeUndefined();
    });
  });

  describe('structural update', () => {
    it('given phase and completedPhases size before apply, input issueCommands slice unchanged', () => {
      const state = createGameStateInCompleteStep();
      const originalPhase = state.currentRoundState.currentPhaseState?.phase;
      const originalCompletedPhasesSize =
        state.currentRoundState.completedPhases.size;

      const event = issueCommandsCompleteEvent(new Set(['E-5']));

      applyCompleteIssueCommandsPhaseEvent(event, state);

      expect(state.currentRoundState.currentPhaseState?.phase).toBe(
        originalPhase,
      );
      expect(state.currentRoundState.completedPhases.size).toBe(
        originalCompletedPhasesSize,
      );
    });
  });

  describe('trusted mechanical apply', () => {
    it('given empty remainingEngagements event despite board engagement, queue stays empty', () => {
      const state = createGameStateInCompleteStep();
      const event = issueCommandsCompleteEvent(new Set());

      const newState = applyCompleteIssueCommandsPhaseEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'resolveMelee') {
        throw new Error('Expected resolveMelee phase');
      }
      expect(phaseState.remainingEngagements.size).toBe(0);
    });

    it('given issueCommands firstPlayerIssueCommands step, still advances to resolveMelee phase', () => {
      const state = createGameStateInCompleteStep();
      const stateWithWrongStep = updatePhaseState(
        state,
        createIssueCommandsPhaseState(state, {
          step: 'firstPlayerIssueCommands',
        }),
      );

      const event = issueCommandsCompleteEvent(new Set(['E-5']));

      const newState = applyCompleteIssueCommandsPhaseEvent(
        event,
        stateWithWrongStep,
      );

      expect(newState.currentRoundState.currentPhaseState?.phase).toBe(
        'resolveMelee',
      );
    });
  });
});
