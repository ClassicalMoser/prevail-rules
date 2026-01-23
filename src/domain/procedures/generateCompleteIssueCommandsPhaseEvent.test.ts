import type { IssueCommandsPhaseState, StandardBoard } from '@entities';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateCompleteIssueCommandsPhaseEvent } from './generateCompleteIssueCommandsPhaseEvent';

describe('generateCompleteIssueCommandsPhaseEvent', () => {
  it('should return a completeIssueCommandsPhase event', () => {
    const state = createEmptyGameState();
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

    const event = generateCompleteIssueCommandsPhaseEvent(stateWithPhase);

    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeIssueCommandsPhase');
  });

  it('should return consistent event regardless of state', () => {
    const state1 = createEmptyGameState();
    const state2 = createEmptyGameState({ currentInitiative: 'white' });

    const event1 = generateCompleteIssueCommandsPhaseEvent(state1);
    const event2 = generateCompleteIssueCommandsPhaseEvent(state2);

    expect(event1).toEqual(event2);
  });
});
