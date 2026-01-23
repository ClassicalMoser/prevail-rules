import {
  createCleanupPhaseState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
} from '@testing';
import { describe, expect, it } from 'vitest';
import {
  getCleanupPhaseState,
  getCurrentPhaseState,
  getIssueCommandsPhaseState,
  getMoveCommandersPhaseState,
  getPlayCardsPhaseState,
  getResolveMeleePhaseState,
} from './getPhaseState';

describe('getCurrentPhaseState', () => {
  it('should return phase state when present', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    const result = getCurrentPhaseState(state);
    expect(result.phase).toBe('playCards');
    expect(result.step).toBe('chooseCards');
  });

  it('should throw error when phase state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = undefined;

    expect(() => getCurrentPhaseState(state)).toThrow(
      'No current phase state found',
    );
  });
});

describe('getPlayCardsPhaseState', () => {
  it('should return play cards phase state', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    const result = getPlayCardsPhaseState(state);
    expect(result.phase).toBe('playCards');
    expect(result.step).toBe('chooseCards');
  });

  it('should throw error when not in playCards phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state);

    expect(() => getPlayCardsPhaseState(state)).toThrow(
      'Expected playCards phase, got issueCommands',
    );
  });

  it('should throw error when phase state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = undefined;

    expect(() => getPlayCardsPhaseState(state)).toThrow(
      'No current phase state found',
    );
  });
});

describe('getMoveCommandersPhaseState', () => {
  it('should return move commanders phase state with moveFirstCommander step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createMoveCommandersPhaseState();

    const result = getMoveCommandersPhaseState(state);
    expect(result.phase).toBe('moveCommanders');
    expect(result.step).toBe('moveFirstCommander');
  });

  it('should return move commanders phase state with moveSecondCommander step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createMoveCommandersPhaseState({
      step: 'moveSecondCommander',
    });

    const result = getMoveCommandersPhaseState(state);
    expect(result.phase).toBe('moveCommanders');
    expect(result.step).toBe('moveSecondCommander');
  });

  it('should throw error when not in moveCommanders phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    expect(() => getMoveCommandersPhaseState(state)).toThrow(
      'Expected moveCommanders phase, got playCards',
    );
  });
});

describe('getIssueCommandsPhaseState', () => {
  it('should return issue commands phase state', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state);

    const result = getIssueCommandsPhaseState(state);
    expect(result.phase).toBe('issueCommands');
    expect(result.step).toBe('firstPlayerResolveCommands');
  });

  it('should throw error when not in issueCommands phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    expect(() => getIssueCommandsPhaseState(state)).toThrow(
      'Expected issueCommands phase, got resolveMelee',
    );
  });
});

describe('getResolveMeleePhaseState', () => {
  it('should return resolve melee phase state', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    const result = getResolveMeleePhaseState(state);
    expect(result.phase).toBe('resolveMelee');
    expect(result.step).toBe('resolveMelee');
  });

  it('should throw error when not in resolveMelee phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState();

    expect(() => getResolveMeleePhaseState(state)).toThrow(
      'Expected resolveMelee phase, got cleanup',
    );
  });
});

describe('getCleanupPhaseState', () => {
  it('should return cleanup phase state', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState();

    const result = getCleanupPhaseState(state);
    expect(result.phase).toBe('cleanup');
    expect(result.step).toBe('discardPlayedCards');
  });

  it('should throw error when not in cleanup phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    expect(() => getCleanupPhaseState(state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});
