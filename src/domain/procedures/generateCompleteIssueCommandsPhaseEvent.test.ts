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

describe('generateCompleteIssueCommandsPhaseEvent', () => {
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

  it('should return a completeIssueCommandsPhase event with remainingEngagements', () => {
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const base = createGameStateWithEngagedUnits(black, white, 'E-5');
    const stateWithPhase = stateInIssueCommandsComplete(base);

    const event = generateCompleteIssueCommandsPhaseEvent(stateWithPhase);

    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeIssueCommandsPhase');
    expect(event.remainingEngagements.has('E-5')).toBe(true);
  });

  it('should return empty remainingEngagements when the board has no engagements', () => {
    const stateWithPhase = stateInIssueCommandsComplete();

    const event = generateCompleteIssueCommandsPhaseEvent(stateWithPhase);

    expect(event.remainingEngagements.size).toBe(0);
  });

  it('should reflect board differences in remainingEngagements', () => {
    const empty = stateInIssueCommandsComplete();
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const engaged = stateInIssueCommandsComplete(
      createGameStateWithEngagedUnits(black, white, 'E-5'),
    );

    const eventEmpty = generateCompleteIssueCommandsPhaseEvent(empty);
    const eventEngaged = generateCompleteIssueCommandsPhaseEvent(engaged);

    expect(eventEmpty.remainingEngagements.size).toBe(0);
    expect(eventEngaged.remainingEngagements.has('E-5')).toBe(true);
  });
});
