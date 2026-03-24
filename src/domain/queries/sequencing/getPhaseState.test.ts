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

/**
 * Phase narrowing helpers: each getter asserts `currentPhaseState.phase` matches the expected
 * tag before returning the typed slice (or throws with expected vs actual).
 */
describe('getCurrentPhaseState', () => {
  it('given playCards phase slice, returns same phase and step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    const result = getCurrentPhaseState(state);
    expect(result.phase).toBe('playCards');
    expect(result.step).toBe('chooseCards');
  });

  it('given missing phase slice, throws no current phase state', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = undefined;

    expect(() => getCurrentPhaseState(state)).toThrow(
      'No current phase state found',
    );
  });
});

describe('getPlayCardsPhaseState', () => {
  it('given playCards factory, returns playCards chooseCards', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    const result = getPlayCardsPhaseState(state);
    expect(result.phase).toBe('playCards');
    expect(result.step).toBe('chooseCards');
  });

  it('given issueCommands slice, throws expected playCards got issueCommands', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state);

    expect(() => getPlayCardsPhaseState(state)).toThrow(
      'Expected playCards phase, got issueCommands',
    );
  });

  it('given missing phase slice, throws no current phase state for playCards getter', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = undefined;

    expect(() => getPlayCardsPhaseState(state)).toThrow(
      'No current phase state found',
    );
  });
});

describe('getMoveCommandersPhaseState', () => {
  it('given default moveCommanders factory, step moveFirstCommander', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createMoveCommandersPhaseState();

    const result = getMoveCommandersPhaseState(state);
    expect(result.phase).toBe('moveCommanders');
    expect(result.step).toBe('moveFirstCommander');
  });

  it('given moveSecondCommander step in slice, getter returns that step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createMoveCommandersPhaseState({
      step: 'moveSecondCommander',
    });

    const result = getMoveCommandersPhaseState(state);
    expect(result.phase).toBe('moveCommanders');
    expect(result.step).toBe('moveSecondCommander');
  });

  it('given playCards slice, throws expected moveCommanders got playCards', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    expect(() => getMoveCommandersPhaseState(state)).toThrow(
      'Expected moveCommanders phase, got playCards',
    );
  });
});

describe('getIssueCommandsPhaseState', () => {
  it('given default issueCommands factory, phase and first resolve step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state);

    const result = getIssueCommandsPhaseState(state);
    expect(result.phase).toBe('issueCommands');
    expect(result.step).toBe('firstPlayerResolveCommands');
  });

  it('given resolveMelee slice, throws expected issueCommands got resolveMelee', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    expect(() => getIssueCommandsPhaseState(state)).toThrow(
      'Expected issueCommands phase, got resolveMelee',
    );
  });
});

describe('getResolveMeleePhaseState', () => {
  it('given default resolveMelee factory, phase and resolveMelee step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    const result = getResolveMeleePhaseState(state);
    expect(result.phase).toBe('resolveMelee');
    expect(result.step).toBe('resolveMelee');
  });

  it('given cleanup slice, throws expected resolveMelee got cleanup', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState();

    expect(() => getResolveMeleePhaseState(state)).toThrow(
      'Expected resolveMelee phase, got cleanup',
    );
  });
});

describe('getCleanupPhaseState', () => {
  it('given default cleanup factory, phase cleanup discardPlayedCards', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState();

    const result = getCleanupPhaseState(state);
    expect(result.phase).toBe('cleanup');
    expect(result.step).toBe('discardPlayedCards');
  });

  it('given playCards slice, throws expected cleanup got playCards', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    expect(() => getCleanupPhaseState(state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});
