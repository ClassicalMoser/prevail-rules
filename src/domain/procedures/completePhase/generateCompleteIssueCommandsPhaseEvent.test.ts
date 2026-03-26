import type { IssueCommandsPhaseState, StandardBoard } from '@entities';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import {
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateCompleteIssueCommandsPhaseEvent } from './generateCompleteIssueCommandsPhaseEvent';

/**
 * Issue-commands phase is done: emit `completeIssueCommandsPhase` with `remainingEngagements`
 * — a set of board coordinates that still hold engaged units (from live board scan).
 */
describe('generateCompleteIssueCommandsPhaseEvent', () => {
  /** Puts `state` in ISSUE_COMMANDS_PHASE step `complete` with empty command queues. */
  function stateInIssueCommandsComplete(
    state = createEmptyGameState(),
  ): typeof state {
    const initialPhaseState: IssueCommandsPhaseState<StandardBoard> = {
      phase: ISSUE_COMMANDS_PHASE,
      step: 'complete',
      remainingCommandsFirstPlayer: new Set(),
      remainingUnitsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set(),
      remainingUnitsSecondPlayer: new Set(),
      currentCommandResolutionState: undefined,
    };
    return updatePhaseState(state, initialPhaseState);
  }

  it('given engaged pair at E-5 and phase complete, remainingEngagements contains E-5', () => {
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const base = createGameStateWithEngagedUnits(black, white, 'E-5');
    const stateWithPhase = stateInIssueCommandsComplete(base);

    const event = generateCompleteIssueCommandsPhaseEvent(stateWithPhase, 0);

    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeIssueCommandsPhase');
    expect(event.remainingEngagements.has('E-5')).toBe(true);
  });

  it('given empty board and phase complete, remainingEngagements is empty', () => {
    const stateWithPhase = stateInIssueCommandsComplete();

    const event = generateCompleteIssueCommandsPhaseEvent(stateWithPhase, 0);

    expect(event.remainingEngagements.size).toBe(0);
  });

  it('given same phase shell, engaged vs empty board yields different remainingEngagements', () => {
    const empty = stateInIssueCommandsComplete();
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const engaged = stateInIssueCommandsComplete(
      createGameStateWithEngagedUnits(black, white, 'E-5'),
    );

    const eventEmpty = generateCompleteIssueCommandsPhaseEvent(empty, 0);
    const eventEngaged = generateCompleteIssueCommandsPhaseEvent(engaged, 0);

    expect(eventEmpty.remainingEngagements.size).toBe(0);
    expect(eventEngaged.remainingEngagements.has('E-5')).toBe(true);
  });
});
