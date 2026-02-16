import type {
  GameState,
  IssueCommandsPhaseState,
  StandardBoard,
} from '@entities';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import {
  createGameStateWithEngagedUnits,
  createTestUnit,
  createEmptyGameState,
} from '@testing';
import { updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateCompleteIssueCommandsPhaseEvent } from './generateCompleteIssueCommandsPhaseEvent';

describe('generateCompleteIssueCommandsPhaseEvent', () => {
  function createStateInCompleteStep(
    state: GameState<StandardBoard>,
  ): GameState<StandardBoard> {
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

  it('should return a completeIssueCommandsPhase event', () => {
    const state = createEmptyGameState();
    const stateWithPhase = createStateInCompleteStep(state);

    const event = generateCompleteIssueCommandsPhaseEvent(stateWithPhase);

    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeIssueCommandsPhase');
  });

  it('should return empty engagements when no engaged units on board', () => {
    const state = createEmptyGameState();
    const stateWithPhase = createStateInCompleteStep(state);

    const event = generateCompleteIssueCommandsPhaseEvent(stateWithPhase);

    expect(event.engagements.size).toBe(0);
  });

  it('should find engagements on the board', () => {
    const blackUnit = createTestUnit('black', { attack: 3 });
    const whiteUnit = createTestUnit('white', { attack: 3 });
    const state = createGameStateWithEngagedUnits(blackUnit, whiteUnit, 'E-5');
    const stateWithPhase = createStateInCompleteStep(state);

    const event = generateCompleteIssueCommandsPhaseEvent(stateWithPhase);

    expect(event.engagements.has('E-5')).toBe(true);
    expect(event.engagements.size).toBe(1);
  });

  it('should find multiple engagements on the board', () => {
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

    const stateWithPhase = createStateInCompleteStep(state);

    const event = generateCompleteIssueCommandsPhaseEvent(stateWithPhase);

    expect(event.engagements.has('E-5')).toBe(true);
    expect(event.engagements.has('E-6')).toBe(true);
    expect(event.engagements.size).toBe(2);
  });
});
