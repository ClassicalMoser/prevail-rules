import {
  createCleanupPhaseState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getCurrentStep } from './getCurrentStep';

describe('getCurrentStep', () => {
  it('should return step from play cards phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createPlayCardsPhaseState();

    const result = getCurrentStep(state);
    expect(result).toBe('chooseCards');
  });

  it('should return step from issue commands phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createIssueCommandsPhaseState(state);

    const result = getCurrentStep(state);
    expect(result).toBe('firstPlayerResolveCommands');
  });

  it('should return step from resolve melee phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState =
      createResolveMeleePhaseState(state);

    const result = getCurrentStep(state);
    expect(result).toBe('resolveMelee');
  });

  it('should return step from cleanup phase', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
    });

    const result = getCurrentStep(state);
    expect(result).toBe('firstPlayerChooseRally');
  });

  it('should throw error when phase state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = undefined;

    expect(() => getCurrentStep(state)).toThrow('No current phase state found');
  });
});
